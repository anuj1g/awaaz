import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String },
  location: { type: String, default: null },
  category: { type: String, default: 'General' },
  media: [{ 
    url: String, 
    type: { type: String, enum: ['image', 'video', 'file'] } 
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  reports: [reportSchema],
  status: { 
    type: String, 
    enum: ['Pending', 'Ongoing', 'Resolved'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Avoid OverwriteModelError
export const Post = (mongoose.models.Post as mongoose.Model<any>) || mongoose.model('Post', postSchema);
