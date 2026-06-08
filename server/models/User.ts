import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  anonymousId: { type: String, unique: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Avoid OverwriteModelError
export const User = (mongoose.models.User as mongoose.Model<any>) || mongoose.model('User', userSchema);
