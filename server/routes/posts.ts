import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

// Helper to call Power Automate Webhook
const notifyPowerAutomate = async (city: string, content: string) => {
  let webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('POWER_AUTOMATE_WEBHOOK_URL is missing in environment variables');
    return;
  }

  // Sanitize: remove quotes or whitespace that might have been pasted accidentally
  webhookUrl = webhookUrl.trim().replace(/^["'](.+)["']$/, '$1');
  
  if (!city) {
    console.log('No city provided for Power Automate notification');
    return;
  }

  console.log(`Triggering Power Automate Webhook for city: ${city}`);

  try {
    // Non-blocking but awaited internally to catch all errors
    console.log('Sending request to Power Automate...');
    const response = await axios.post(webhookUrl, { city, content }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // Don't hang for too long
    });
    console.log('Power Automate Webhook Success:', response.status);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      const errorData = err.response.data;
      const isDirectApiAuth = errorData?.error?.code === 'DirectApiAuthorizationRequired';
      
      console.error('POWER AUTOMATE AUTHENTICATION ERROR (401):');
      console.error('Message:', errorData?.error?.message || err.message);
      
      if (isDirectApiAuth) {
        console.error('REQUIRED ACTION: In Power Automate, edit your flow trigger ("When a HTTP request is received").');
        console.error('1. Open the "Who can trigger the flow?" dropdown (it might be under "Show advanced options").');
        console.error('2. Change it to "Any user" to allow unauthenticated requests with the private signature in the URL.');
        console.error('Current setting requires OAuth which this application is not configured for.');
      }
    } else {
      console.error('Power Automate Webhook Error:', err.message);
      if (err.response) {
        console.error('Response Status:', err.response.status);
        console.error('Response Data:', JSON.stringify(err.response.data));
      }
    }
  }
};

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Setup
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  // Use Cloudinary Storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return {
        folder: 'awaaz_uploads',
        resource_type: isVideo ? 'video' : 'auto',
        format: path.extname(file.originalname).substring(1),
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
      };
    },
  });
  console.log('Cloudinary Storage active');
} else {
  // Fallback to Disk Storage
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  console.warn('Cloudinary keys missing, using local disk storage.');
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const getAnonymousName = (userId: any) => {
  if (!userId) return 'Anonymous User';
  const idStr = userId.toString();
  const chars = idStr.split('');
  const hash = chars.reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  // Returns something like User-1234
  const anonymousId = 1000 + (hash % 9000);
  return `User-${anonymousId}`;
};

// Multiple Upload route
router.post('/upload-multiple', authenticate, upload.array('media', 5), (req: any, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const files = req.files.map((file: any) => {
    // Cloudinary storage uses file.path as the full URL
    // Local storage uses file.filename which we prefix with /uploads/
    const url = file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
    
    return {
      url,
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 'file'
    };
  });
                   
  res.json(files);
});

// Single Upload route (kept for backward compatibility)
router.post('/upload', authenticate, upload.single('media'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const url = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 
                   req.file.mimetype.startsWith('video/') ? 'video' : 'file';
                   
  res.json({ url, type: fileType });
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await (Post as any).find().sort({ createdAt: -1 }).lean();
    
    // Mask user names for anonymity and ensure media is explicitly returned
    // PRIVACY: Explicitly exclude location from response
    const anonymizedPosts = posts.map((post: any) => {
      const { location, ...postWithoutLocation } = post;
      return {
        ...postWithoutLocation,
        media: post.media || [], 
        userName: getAnonymousName(post.userId),
        comments: (post.comments || []).map((comment: any) => ({
          ...comment,
          userName: getAnonymousName(comment.userId)
        }))
      };
    });

    res.json(anonymizedPosts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    console.log('Post creation request received:', JSON.stringify(req.body, null, 2));
    let { content, media, category, location } = req.body;
    
    // Deep sanitize media: ensure it's an array of valid objects and not HTML error pages or strings
    if (Array.isArray(media)) {
      media = media.filter(item => 
        item && 
        typeof item === 'object' && 
        !Array.isArray(item) &&
        item.url && 
        typeof item.url === 'string' &&
        !item.url.trim().startsWith('<!doctype') &&
        !item.url.trim().startsWith('<html')
      );
    } else {
      // If it's not an array (e.g. a string containing HTML error), force it to an empty array
      console.warn('Received invalid media format (not an array), ignoring. Value type:', typeof media);
      media = [];
    }

    if (!content && media.length === 0) {
      return res.status(400).json({ message: 'Post must have either content or media' });
    }

    const user = await (User as any).findById(req.user?.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('Saving post with sanitized media:', JSON.stringify(media, null, 2));

    const newPost = new Post({
      userId: user._id,
      userName: getAnonymousName(user._id), 
      content: content || '',
      category: category || 'General',
      media: media, 
      location: location || null
    });

    const post = await newPost.save();
    console.log('Post saved successfully with ID:', post._id);
    
    // Trigger Power Automate Webhook Asynchronously
    if (location) {
      console.log('Post created with location, triggering notification...');
      notifyPowerAutomate(location, content);
    } else {
      console.log('Post created without location, skipping notification.');
    }

    // Return post without location for privacy
    const result = post.toObject() as any;
    delete result.location;
    
    // Ensure userName is set in the response (as it is for listing)
    result.userName = getAnonymousName(result.userId);
    
    res.json(result);
  } catch (err: any) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update post
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    let post = await (Post as any).findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    const { content, category, media } = req.body;
    const updatedPost = await (Post as any).findByIdAndUpdate(
      req.params.id,
      { $set: { content, category, media } },
      { new: true }
    ).lean();

    if (updatedPost) {
      updatedPost.userName = getAnonymousName(updatedPost.userId);
    }
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const post = await (Post as any).findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await (Post as any).findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const post = await (Post as any).findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userIdx = post.likes.indexOf(req.user?.userId as any);
    if (userIdx > -1) {
      post.likes.splice(userIdx, 1); // Unlike
    } else {
      post.likes.push(req.user?.userId as any); // Like
    }

    await post.save();
    const result = post.toObject() as any;
    result.userName = getAnonymousName(result.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on post
router.post('/:id/comment', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const user = await (User as any).findById(req.user?.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const post = await (Post as any).findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      userId: user._id,
      userName: getAnonymousName(user._id),
      content
    };

    post.comments.push(newComment as any);
    await post.save();
    
    const result = post.toObject() as any;
    result.userName = getAnonymousName(result.userId);
    result.comments = (result.comments || []).map((c: any) => ({
      ...c,
      userName: getAnonymousName(c.userId)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Report post
router.post('/:id/report', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reason, message } = req.body;
    const post = await (Post as any).findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.reports.push({
      userId: req.user?.userId as any,
      reason,
      message
    });

    await post.save();
    res.json({ message: 'Post reported successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post status
router.put('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Ongoing', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const post = await (Post as any).findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only owner can update status for now (simulation of marking resolved)
    if (post.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    post.status = status;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
