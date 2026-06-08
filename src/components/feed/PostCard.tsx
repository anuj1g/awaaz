import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, Share2, MoreVertical, Flag, Edit, Trash2, User, Download, Paperclip, CheckCircle, Clock, AlertCircle, X, Link2 } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PostCardProps {
  post: any;
  onUpdate: () => void;
  openAuth: () => void;
  showStatus?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, openAuth, showStatus = false }) => {
  const { user, token } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [reportReason, setReportReason] = useState('Offensive Content');
  const [reportMsg, setReportMsg] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with props when user or post changes
  React.useEffect(() => {
    setIsLiked(post.likes.includes(user?.id));
    setEditContent(post.content);
  }, [post.likes, post.content, user?.id]);

  const handleLike = async () => {
    if (!user) return openAuth();
    setIsLiked(!isLiked);
    try {
      await axios.post(`/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (err) {
      console.error(err);
      setIsLiked(post.likes.includes(user?.id));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return openAuth();
    if (!commentContent.trim()) return;

    try {
      await axios.post(`/api/posts/${post._id}/comment`, { content: commentContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentContent('');
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowMenu(false);
    try {
      await axios.delete(`/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to delete post.');
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`/api/posts/${post._id}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async () => {
    try {
      await axios.post(`/api/posts/${post._id}/report`, 
        { reason: reportReason, message: reportMsg }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowReport(false);
      setReportMsg('');
      alert('Report submitted successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    setShowShare(true);
  };

  const copyLink = () => {
    const url = window.location.origin + "/?post=" + post._id;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = `Check out this post on Awaaz: ${post.content.substring(0, 100)}... ${window.location.origin}/?post=${post._id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareX = () => {
    const text = `Check out this post on Awaaz: ${post.content.substring(0, 100)}...`;
    const url = `${window.location.origin}/?post=${post._id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    setShowMenu(false);
    try {
      await axios.put(`/api/posts/${post._id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isOwner = user?.id === post.userId;

  const renderStatusBadge = () => {
    if (!showStatus) return null;
    const status = post.status || 'Pending';
    const configs: Record<string, { color: string, icon: any, label: string }> = {
      'Pending': { color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: AlertCircle, label: 'Pending' },
      'Ongoing': { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Clock, label: 'Ongoing' },
      'Resolved': { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle, label: 'Resolved' },
    };
    const config = configs[status] || configs['Pending'];
    const Icon = config.icon;

    return (
      <div className={cn("flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider", config.color)}>
        <Icon size={12} />
        <span>{config.label}</span>
      </div>
    );
  };

  return (
    <div className={cn(
      "bg-card rounded-xl border border-border-subtle overflow-hidden transition-opacity duration-300",
      isDeleting ? "opacity-30 pointer-events-none" : "opacity-100"
    )}>
      <div className="p-6 relative">
        {(isDeleting || isUpdatingStatus) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
             <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-text-main text-sm">{post.userName}</h4>
                {renderStatusBadge()}
              </div>
              <p className="text-[10px] text-text-muted mt-0.5 font-medium">{formatDate(post.createdAt)} • <span className="text-accent">#{post.category}</span></p>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-full text-text-muted transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-card border border-border-subtle rounded-xl shadow-2xl z-10 py-1 overflow-hidden">
                {isOwner ? (
                  <>
                    {showStatus && (
                      <>
                        <div className="px-4 py-2 text-[10px] font-black uppercase text-text-muted border-b border-border-subtle/50 mb-1">Status Controls</div>
                        {['Pending', 'Ongoing', 'Resolved'].map((s) => (
                          <button 
                            key={s}
                            onClick={() => handleUpdateStatus(s)} 
                            className={cn(
                              "w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center justify-between",
                              post.status === s ? "text-accent font-bold" : "text-text-main"
                            )}
                          >
                            <span>Mark {s}</span>
                            {post.status === s && <CheckCircle size={12} />}
                          </button>
                        ))}
                        <div className="border-t border-border-subtle/50 my-1" />
                      </>
                    )}
                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-white/5 flex items-center space-x-2">
                      <Edit size={14} /> <span>Edit Post</span>
                    </button>
                    <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center space-x-2">
                      <Trash2 size={14} /> <span>Delete Post</span>
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setShowReport(true); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-white/5 flex items-center space-x-2">
                    <Flag size={14} /> <span>Report Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main outline-none focus:border-accent"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex items-center space-x-2 justify-end">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-text-muted px-3 py-1">Cancel</button>
              <button onClick={handleEdit} className="text-xs font-bold bg-accent text-white px-4 py-2 rounded-lg">Save Changes</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-text-main text-[15px] leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
            
            {post.media && post.media.length > 0 && (
              <div className="space-y-3 mb-4">
                {post.media.map((m: any, idx: number) => {
                  // Ensure URL is relative to root if it starts with /uploads
                  const mediaUrl = m.url;
                  
                  return (
                    <div key={`${post._id}-media-${idx}`} className="rounded-xl overflow-hidden border border-border-subtle bg-black/5">
                      {m.type === 'image' ? (
                        <img 
                          src={mediaUrl} 
                          className="w-full h-auto max-h-[500px] object-cover block" 
                          alt="Post content" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : m.type === 'video' ? (
                        <video 
                          src={mediaUrl} 
                          className="w-full h-auto max-h-[500px] block" 
                          controls 
                          preload="metadata"
                          playsInline
                        />
                      ) : (
                        <a 
                          href={mediaUrl} 
                          download 
                          className="bg-background flex items-center justify-between p-4 group hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip size={20} className="text-accent" />
                            <span className="text-sm text-text-main font-medium truncate max-w-[200px]">Attachment {idx + 1}</span>
                          </div>
                          <Download size={18} className="text-text-muted group-hover:text-accent transition-colors" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center space-x-8 border-top border-border-subtle pt-4">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 transition-all active:scale-95 text-sm",
              isLiked ? "text-accent" : "text-text-muted hover:text-text-main"
            )}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="font-medium">{post.likes.length} Likes</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-text-muted hover:text-text-main transition-colors text-sm"
          >
            <MessageCircle size={18} />
            <span className="font-medium">{post.comments.length} Comments</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-text-muted hover:text-text-main transition-colors text-sm"
          >
            <Share2 size={18} />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowShare(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-card w-full max-w-sm rounded-2xl p-6 border border-border-subtle shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-main">Share Post</h3>
                <button onClick={() => setShowShare(false)} className="p-2 hover:bg-white/5 rounded-full text-text-muted transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6 p-4 bg-background/50 rounded-xl border border-border-subtle">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                    <User size={14} />
                  </div>
                  <span className="text-xs font-bold text-text-main">{post.userName}</span>
                </div>
                <p className="text-text-main text-sm line-clamp-3 leading-relaxed">{post.content}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button onClick={shareWhatsApp} className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-lg shadow-transparent group-hover:shadow-[#25D366]/20">
                    <WhatsAppIcon size={24} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-tight text-text-muted group-hover:text-text-main">WhatsApp</span>
                </button>
                
                <button onClick={shareX} className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-text-main group-hover:bg-text-main group-hover:text-black transition-all shadow-lg shadow-transparent group-hover:shadow-white/10">
                    <XBrandIcon size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-tight text-text-muted group-hover:text-text-main">Post on X</span>
                </button>

                <button onClick={copyLink} className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all shadow-lg shadow-transparent group-hover:shadow-accent/20">
                    <Link2 size={24} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-tight text-text-muted group-hover:text-text-main">Copy Link</span>
                </button>
              </div>

              <button 
                onClick={copyLink}
                className="w-full bg-background border border-border-subtle rounded-xl p-3 flex items-center justify-between group hover:border-accent transition-colors"
              >
                <span className="text-xs text-text-muted truncate mr-4">{window.location.origin}/?post={post._id}</span>
                <span className="text-[10px] uppercase font-black text-accent shrink-0">Copy</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-background/20 border-t border-border-subtle overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                {post.comments.map((comment: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border-subtle flex items-center justify-center text-text-muted">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="bg-card px-4 py-2 rounded-xl border border-border-subtle">
                        <p className="text-xs font-bold text-text-main">{comment.userName}</p>
                        <p className="text-xs text-text-muted mt-1">{comment.content}</p>
                      </div>
                      <p className="text-[9px] text-text-muted/60 mt-1 uppercase font-bold tracking-widest">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {user ? (
                <form onSubmit={handleComment} className="flex items-center space-x-3 mt-6">
                  <div className="flex-1 bg-background border border-border-subtle rounded-lg px-4 py-2">
                    <input 
                      type="text" 
                      placeholder="Share your thoughts..." 
                      className="w-full bg-transparent border-none outline-none text-xs text-text-main placeholder:text-text-muted/50"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="bg-accent text-white p-2.5 rounded-lg shadow-lg shadow-accent/20">
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={openAuth} className="w-full py-3 text-xs font-bold text-text-muted group">
                  Login to <span className="text-accent group-hover:underline">comment</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowReport(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-card w-full max-w-sm rounded-2xl p-8 border border-border-subtle shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <h3 className="text-xl font-bold text-text-main mb-6">Report Issue</h3>
              <div className="space-y-4">
                <select 
                  className="w-full bg-background border border-border-subtle p-3 rounded-lg outline-none text-sm text-text-main font-medium"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option>Offensive Content</option>
                  <option>Misinformation</option>
                  <option>Harassment</option>
                  <option>Violence</option>
                  <option>Spam</option>
                </select>
                <textarea 
                  placeholder="Provide more details..."
                  className="w-full bg-background border border-border-subtle p-3 rounded-lg outline-none text-sm text-text-main min-h-[100px]"
                  value={reportMsg}
                  onChange={(e) => setReportMsg(e.target.value)}
                />
                <div className="flex space-x-3 pt-4">
                  <button onClick={() => setShowReport(false)} className="flex-1 py-3 text-sm font-bold text-text-muted hover:text-text-main bg-white/5 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleReport} className="flex-1 py-3 text-sm font-bold text-white bg-red-600 rounded-lg shadow-lg shadow-red-900/20 active:scale-95 transition-all">Submit Report</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Send = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const WhatsAppIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.122.541 4.194 1.565 6.035l-1.662 6.069 6.204-1.627a11.78 11.78 0 005.94 1.603h.005c6.635 0 12.03-5.395 12.034-12.032a11.761 11.761 0 00-3.489-8.492" />
  </svg>
);

const XBrandIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
  </svg>
);
