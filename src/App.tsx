import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { CreatePost } from './components/feed/CreatePost';
import { PostCard } from './components/feed/PostCard';
import { AuthModal } from './components/auth/AuthModals';
import { Settings } from './components/profile/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const AwaazApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const handleNavClick = (view: string) => {
    if (view === 'create') {
      if (!user) return openAuth('login');
      setIsCreateOpen(true);
    } else {
      setActiveView(view);
    }
  };

  const openAuth = (type: 'login' | 'signup' = 'login') => {
    setAuthType(type);
    setIsAuthOpen(true);
  };

  const filteredPosts = posts.filter((post: any) => {
    let match = true;
    if (activeCategory) match = post.category === activeCategory;
    if (match && activeView === 'activity' && user) {
      match = post.userId?.toString() === user.id?.toString();
    }
    return match;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-text-main">
       <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
       <h1 className="text-xl font-black uppercase tracking-tighter text-accent">Awaaz</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text-main">
      <Navbar />
      
      <div className="max-w-[1440px] mx-auto flex pt-16">
        <Sidebar activeView={activeView} onNavClick={handleNavClick} />
        
        <main className="flex-1 px-4 md:px-8 py-8 md:ml-64 lg:mr-80">
          <div className="max-w-2xl mx-auto space-y-8">
            
            {activeView === 'home' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <CreatePost 
                  onSuccess={() => setRefreshTrigger(t => t+1)} 
                  openAuth={openAuth} 
                />
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">
                  {activeView === 'activity' ? 'Track My Voice' : 
                   activeView === 'notifications' ? 'Social Alert' :
                   activeView === 'settings' ? 'System Configuration' :
                   (activeCategory ? `# ${activeCategory}` : 'Community Feed')}
                </h2>
                <div className="h-[1px] flex-1 bg-border-subtle ml-6 hidden sm:block" />
              </div>

              {activeView === 'settings' ? (
                <Settings />
              ) : activeView === 'notifications' ? (
                <div className="space-y-4">
                  {[
                    { id: 1, text: "Someone liked your post about Climate Action", time: "2h ago" },
                    { id: 2, text: "Welcome to Awaaz! Complete your profile to get more reach.", time: "1d ago" },
                    { id: 3, text: "Community Alert: New initiative in Education Reform near you.", time: "2d ago" }
                  ].map(notif => (
                    <div key={notif.id} className="bg-card p-6 rounded-xl border border-border-subtle flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                      <p className="text-sm text-text-muted group-hover:text-text-main transition-colors">{notif.text}</p>
                      <span className="text-[10px] uppercase font-black text-accent">{notif.time}</span>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post: any) => (
                  <motion.div 
                    layout
                    key={post._id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                  >
                    <PostCard 
                      post={post} 
                      onUpdate={() => setRefreshTrigger(t => t+1)} 
                      openAuth={openAuth} 
                      showStatus={activeView === 'activity'}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="bg-card rounded-2xl p-12 text-center border border-border-subtle italic text-text-muted/40">
                  <p>No issues found in this stream.</p>
                  {!user && activeView === 'activity' && (
                    <button onClick={() => openAuth('login')} className="mt-4 text-accent font-bold underline not-italic">Login to access your activity</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <RightSidebar activeCategory={activeCategory} onCategoryFilter={setActiveCategory} />
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        type={authType} 
        setType={setAuthType} 
      />

      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg z-10"
            >
              <div className="mb-4 flex justify-between items-center text-text-main px-2">
                <h3 className="text-xl font-black uppercase tracking-tight">Express Your Voice</h3>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={24} className="text-text-muted" />
                </button>
              </div>
              <CreatePost 
                onSuccess={() => {
                  setRefreshTrigger(t => t+1);
                  setIsCreateOpen(false);
                }} 
                openAuth={openAuth} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Login CTA for Guest */}
      {!user && !isAuthOpen && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-accent text-white px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center space-x-8 z-40 border border-white/20"
        >
          <span className="text-sm font-bold tracking-tight">Ready to join the movement?</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => openAuth('login')} className="bg-white text-accent px-5 py-2 rounded-lg text-xs font-black uppercase shadow-lg active:scale-95 transition-all">Sign In</button>
            <button onClick={() => openAuth('signup')} className="text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-white/10 transition-colors">Register</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AwaazApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
