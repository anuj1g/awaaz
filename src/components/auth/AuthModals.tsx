import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, User, Phone, ShieldCheck, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import emailjs from '@emailjs/browser';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  setType: (type: 'login' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, setType }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP States
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError('Please enter your email first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    setIsOtpLoading(true);
    setError('');
    setSuccess('');

    try {
      // First check if user already exists
      const checkRes = await axios.post('/api/auth/check-exists', { email: formData.email });
      if (checkRes.data.exists) {
        setError('This email is already registered. Please login.');
        setIsOtpLoading(false);
        return;
      }
    } catch (err) {
      console.error('Check user error:', err);
      // If endpoint doesn't exist yet, we'll create it or skip
    }
    
    // Generate 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    if (!serviceId || !templateId || !publicKey) {
      setIsOtpLoading(false);
      setError('Email verification is not configured. Please add VITE_EMAILJS keys in Settings -> Secrets.');
      return;
    }

    const templateParams = {
      to_email: formData.email, // This matches the standard {{to_email}}
      user_email: formData.email, // Backup: {{user_email}}
      email: formData.email,      // Backup: {{email}}
      otp: newOtp,
      user_name: `${formData.firstName} ${formData.lastName}`
    };

    try {
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      setIsOtpSent(true);
      setIsTimerActive(true);
      setTimer(60);
      setSuccess('OTP successfully sent to ' + formData.email);
    } catch (err: any) {
      console.error('EmailJS Error:', err);
      setError(`Email failed: ${err?.text || 'Invalid Service/Template ID or Public Key'}. Check EmailJS Dashboard.`);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (otp === generatedOtp && otp !== '') {
      setIsOtpVerified(true);
      setSuccess('Email verified successfully!');
      setError('');
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (type === 'signup' && !isOtpVerified) {
      setError('Please verify your email via OTP first');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
      const requestData = type === 'login' ? formData : { ...formData, isVerified: true };
      const res = await axios.post(endpoint, requestData);
      login(res.data.token, res.data.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border-subtle"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">
                {type === 'login' ? 'Authenticate' : 'Join Awaaz'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 text-red-500 text-sm font-medium rounded-xl border border-red-500/20 italic">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-500 text-sm font-medium rounded-xl border border-emerald-500/20 italic">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="First Name" 
                      className="w-full bg-background border border-border-subtle focus:border-accent outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-text-main"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="Last Name" 
                      className="w-full bg-background border border-border-subtle focus:border-accent outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-text-main"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input 
                      required
                      type="email" 
                      disabled={isOtpVerified || (type === 'signup' && isOtpSent)}
                      placeholder="Email Address" 
                      className="w-full bg-background border border-border-subtle focus:border-accent outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-text-main disabled:opacity-50"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  {type === 'signup' && !isOtpVerified && (
                    <button 
                      type="button"
                      disabled={isOtpLoading || isTimerActive || isOtpSent}
                      onClick={handleSendOTP}
                      className="bg-accent/10 text-accent px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-accent hover:text-white transition-all disabled:opacity-30 whitespace-nowrap"
                    >
                      {isOtpLoading ? 'Sending...' : isOtpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  )}
                  {type === 'signup' && isOtpVerified && (
                    <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase">Verified</span>
                    </div>
                  )}
                </div>

                {type === 'signup' && isOtpSent && !isOtpVerified && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 pt-2 overflow-hidden"
                  >
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input 
                          type="text" 
                          maxLength={6}
                          placeholder="6-digit OTP" 
                          className="w-full bg-background border border-border-subtle focus:border-accent outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-text-main font-mono tracking-[0.5em]"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleVerifyOTP}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all"
                      >
                        Verify
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center space-x-2 text-text-muted">
                        <Timer size={14} />
                        <span className="text-[10px] font-bold">{formatTime(timer)}</span>
                      </div>
                      {!isTimerActive && (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsOtpSent(false);
                            handleSendOTP();
                          }}
                          className="text-[10px] font-black uppercase text-accent hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {type === 'signup' && (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    required
                    type="tel" 
                    placeholder="Phone Number" 
                    className="w-full bg-background border border-border-subtle focus:border-accent outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-text-main"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  required
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-background border border-border-subtle focus:border-accent outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-text-main"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <button 
                disabled={isLoading || (type === 'signup' && !isOtpVerified)}
                type="submit" 
                className="w-full bg-accent text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Wait a moment...' : (type === 'login' ? 'Continue' : 'Create Profile')}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-text-muted">
                {type === 'login' ? "New here?" : "Already a member?"}
              </span>
              <button 
                onClick={() => {
                  setType(type === 'login' ? 'signup' : 'login');
                  setIsOtpSent(false);
                  setIsOtpVerified(false);
                  setError('');
                  setSuccess('');
                }}
                className="ml-2 font-bold text-accent hover:underline"
              >
                {type === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
