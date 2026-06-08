import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'awaaz_secret_key_2026';

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, isVerified } = req.body;
    
    // Safety check for OTP verification (Requested by user)
    if (!isVerified) {
      return res.status(400).json({ message: 'Email must be verified via OTP before registration' });
    }
    
    // Check if user already exists with email or phone
    const existingUser = await (User as any).findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} is already registered. Please login instead.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, firstName, lastName, email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await (User as any).findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Me
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await (User as any).findById(req.user?.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if email or phone exists
router.post('/check-exists', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const query: any = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;
    
    if (Object.keys(query).length === 0) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }

    const user = await (User as any).findOne(query);
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
