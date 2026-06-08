import React from 'react';
import { Megaphone, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="h-16 bg-background border-b border-border-subtle flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <Megaphone size={20} />
        </div>
        <span className="text-xl font-black tracking-tighter text-accent uppercase">Awaaz</span>
      </div>

      <div className="hidden sm:flex items-center bg-card rounded-lg px-4 py-2 w-96 max-w-lg border border-border-subtle focus-within:border-accent transition-all">
        <Search size={18} className="text-text-muted" />
        <input 
          type="text" 
          placeholder="Search issues, posts, or people..." 
          className="bg-transparent border-none outline-none flex-1 ml-2 text-sm text-text-muted placeholder:text-text-muted/50"
        />
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-text-main hidden md:block">{user.firstName} {user.lastName}</span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
              <UserIcon size={16} />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button className="text-sm font-bold text-accent px-4 py-2 hover:opacity-80 transition-opacity">Join Awaaz</button>
          </div>
        )}
      </div>
    </nav>
  );
};
