import React from 'react';
import { Home, PlusSquare, History, Bell, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onNavClick: (view: string) => void;
  activeView: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavClick, activeView }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Create Post', icon: PlusSquare },
    ...(user ? [
      { id: 'activity', label: 'My Activity', icon: History },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ] : []),
  ];

  return (
    <aside className="w-64 h-[calc(100vh-64px)] fixed left-0 top-16 bg-background border-r border-border-subtle flex flex-col justify-between p-4 overflow-y-auto hidden md:flex">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavClick(item.id)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeView === item.id 
                ? "bg-card text-text-main border border-border-subtle shadow-lg" 
                : "text-text-muted hover:bg-card/50"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-4 space-y-4">
        {user ? (
          <div className="flex flex-col space-y-4">
            <div className="bg-card border border-border-subtle rounded-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-main truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-text-muted truncate">@{user.firstName.toLowerCase()}_{user.lastName.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-4 italic">Login to see your profile</p>
        )}
      </div>
    </aside>
  );
};
