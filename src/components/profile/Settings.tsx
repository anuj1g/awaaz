import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Eye, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'display', label: 'Appearance', icon: Sun },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border-subtle overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-r border-border-subtle bg-background/50 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                activeTab === tab.id 
                  ? "bg-accent text-white shadow-lg shadow-accent/20" 
                  : "text-text-muted hover:bg-white/5 hover:text-text-main"
              )}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-text-main">Profile Settings</h3>
                <p className="text-sm text-text-muted mt-1">Update your personal information and how others see you.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.firstName}
                    className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.lastName}
                    className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    defaultValue={user?.email}
                    className="w-full bg-background/50 border border-border-subtle rounded-xl p-3 text-sm text-text-muted cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Bio</label>
                  <textarea 
                    placeholder="Tell the community about yourself..."
                    className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:border-accent outline-none min-h-[100px]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle">
                <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'display' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-text-main">Appearance Settings</h3>
                <p className="text-sm text-text-muted mt-1">Customize how Awaaz looks on your device.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 group",
                    theme === 'light' 
                      ? "border-accent bg-accent/5 ring-1 ring-accent" 
                      : "border-border-subtle bg-background hover:border-text-muted/30"
                  )}
                >
                  <div className="w-full aspect-video bg-white rounded-xl border border-border-subtle mb-4 overflow-hidden flex items-center justify-center">
                     <Sun className="text-zinc-900" size={32} />
                  </div>
                  <span className={cn("text-sm font-bold", theme === 'light' ? "text-accent" : "text-text-muted")}>Light Mode</span>
                  {theme === 'light' && (
                    <div className="absolute top-3 right-3 w-4 h-4 bg-accent rounded-full border-2 border-card flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </button>

                <button 
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 group",
                    theme === 'dark' 
                      ? "border-accent bg-accent/5 ring-1 ring-accent" 
                      : "border-border-subtle bg-background hover:border-text-muted/30"
                  )}
                >
                  <div className="w-full aspect-video bg-zinc-900 rounded-xl border border-white/10 mb-4 overflow-hidden flex items-center justify-center">
                     <Moon className="text-white" size={32} />
                  </div>
                  <span className={cn("text-sm font-bold", theme === 'dark' ? "text-accent" : "text-text-muted")}>Dark Mode</span>
                  {theme === 'dark' && (
                    <div className="absolute top-3 right-3 w-4 h-4 bg-accent rounded-full border-2 border-card flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start space-x-3">
                 <Monitor className="text-accent mt-0.5" size={18} />
                 <p className="text-xs text-text-muted leading-relaxed">
                   <strong className="text-text-main block mb-1">Adaptive Rendering</strong>
                   Our theme engine uses hardware-accelerated CSS variables for seamless transitions between dark and light modes without affecting performance.
                 </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-text-main">Security & Password</h3>
                <p className="text-sm text-text-muted mt-1">Manage your password and account security sessions.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full bg-background border border-border-subtle rounded-xl p-3 text-sm text-text-main focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle">
                <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-text-main">Notification Preferences</h3>
                <p className="text-sm text-text-muted mt-1">Control which updates you receive from the community.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive updates via your registered email." },
                  { title: "Push Notifications", desc: "Get real-time alerts in your browser." },
                  { title: "Activity Summary", desc: "Weekly digest of trending issues and actions." },
                  { title: "Community Alerts", desc: "Emergency or critical awareness updates." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background border border-border-subtle rounded-xl">
                    <div>
                      <h4 className="text-sm font-bold text-text-main">{item.title}</h4>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                    <div className="w-12 h-6 bg-accent/20 rounded-full relative cursor-pointer border border-accent/20">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-accent rounded-full shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-xl font-bold text-text-main">Privacy & Data</h3>
                <p className="text-sm text-text-muted mt-1">Control your visibility and manage your data.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background border border-border-subtle rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Eye size={20} className="text-text-muted" />
                    <div>
                      <h4 className="text-sm font-bold text-text-main">Profile Visibility</h4>
                      <p className="text-xs text-text-muted">Make your profile public to the entire community.</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>

                <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-4 mt-12">
                   <div className="flex items-center space-x-3 text-red-500">
                      <Trash2 size={20} />
                      <h4 className="font-bold">Danger Zone</h4>
                   </div>
                   <p className="text-xs text-text-muted">Once you delete your account, there is no going back. All your posts and data will be permanently removed.</p>
                   <button className="bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                      Delete My Account
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
