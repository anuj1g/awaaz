import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Image, Video, FileText, Send, User, X, Paperclip, MapPin, Navigation } from 'lucide-react';

interface CreatePostProps {
  onSuccess: () => void;
  openAuth: () => void;
}

interface SelectedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'file';
}

export const CreatePost: React.FC<CreatePostProps> = ({ onSuccess, openAuth }) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use a free geocoding API or simple lat/lng display
          // For this requirement, we'll try to get city name via reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state || "Unknown Location";
          setLocation(city);
          setShowLocationInput(false);
        } catch (err) {
          console.error("Geocoding failed", err);
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        alert("Unable to retrieve your location. Please enter it manually.");
        setIsGettingLocation(false);
        setShowLocationInput(true);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: SelectedFile[] = Array.from(files).map((file: File) => {
      let type: 'image' | 'video' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      return {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        type
      };
    });

    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    
    // Reset input
    if (e.target) e.target.value = '';
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const triggerFileInput = (type: string) => {
    if (!user) return openAuth();
    if (fileInputRef.current) {
      if (type === 'image') fileInputRef.current.accept = "image/*";
      else if (type === 'video') fileInputRef.current.accept = "video/*";
      else fileInputRef.current.accept = "*/*";
      
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return openAuth();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      let mediaData: any[] = [];

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(sf => {
          formData.append('media', sf.file);
        });
        
        const uploadRes = await axios.post('/api/posts/upload-multiple', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Handle security challenge HTML response from platform or platform-injected HTML
        if (typeof uploadRes.data === 'string' && (uploadRes.data.includes('<!doctype html>') || uploadRes.data.includes('Cookie check'))) {
           throw new Error('Authentication challenge received. Please refresh the page and try again.');
        }
        
        if (!Array.isArray(uploadRes.data)) {
           // If we got a successful response but it's not an array, it might be an error object or HTML
           console.error('Unexpected upload response:', uploadRes.data);
           throw new Error('Upload failed: Unexpected response from server.');
        }

        mediaData = uploadRes.data;
      }

      await axios.post('/api/posts', 
        { content, media: mediaData, location: location || manualLocation }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setContent('');
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);
      setLocation(null);
      setManualLocation('');
      setShowLocationInput(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border-subtle p-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0">
          <User size={20} />
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Share an update or raise an issue...`}
            className="w-full bg-background border border-border-subtle rounded-2xl outline-none resize-none text-text-main placeholder:text-text-muted/50 p-3 min-h-[50px] text-sm focus:border-accent transition-all"
          />

          {selectedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {selectedFiles.map((file) => (
                <div key={file.id} className="relative group rounded-xl overflow-hidden border border-border-subtle bg-background">
                  {file.type === 'image' ? (
                    <img src={file.preview} className="w-full h-32 object-cover" alt="Preview" />
                  ) : file.type === 'video' ? (
                    <video src={file.preview} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="h-32 flex items-center justify-center space-x-2 p-2">
                      <Paperclip size={16} className="text-accent" />
                      <span className="text-[10px] text-text-main font-medium truncate">{file.file.name}</span>
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(location || showLocationInput) && (
            <div className="mt-4 p-3 bg-background border border-border-subtle rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-medium text-text-main">
                <MapPin size={14} className="text-accent" />
                {showLocationInput ? (
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Enter city name..."
                    className="bg-transparent outline-none border-b border-accent/30 focus:border-accent w-full"
                    autoFocus
                  />
                ) : (
                  <span>{location}</span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => { setLocation(null); setManualLocation(''); setShowLocationInput(false); }}
                className="text-text-muted hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
          />

          <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-4">
              <button 
                onClick={() => triggerFileInput('image')}
                type="button" className="flex items-center space-x-2 text-text-muted hover:text-text-main transition-colors"
              >
                <Image size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Image</span>
              </button>
              <button 
                onClick={() => triggerFileInput('video')}
                type="button" className="flex items-center space-x-2 text-text-muted hover:text-text-main transition-colors"
              >
                <Video size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Video</span>
              </button>
              <button 
                onClick={() => triggerFileInput('file')}
                type="button" className="flex items-center space-x-2 text-text-muted hover:text-text-main transition-colors"
              >
                <FileText size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">File</span>
              </button>

              <div className="h-4 w-[1px] bg-border-subtle mx-1 hidden sm:block"></div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  type="button" className={`flex items-center space-x-2 transition-colors ${location ? 'text-accent' : 'text-text-muted hover:text-text-main'}`}
                  title="Current Location"
                >
                  <Navigation size={16} className={isGettingLocation ? 'animate-pulse' : ''} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {isGettingLocation ? 'Locating...' : 'Current'}
                  </span>
                </button>
                <button 
                  onClick={() => setShowLocationInput(true)}
                  type="button" className={`flex items-center space-x-2 transition-colors ${manualLocation ? 'text-accent' : 'text-text-muted hover:text-text-main'}`}
                  title="Manual Location"
                >
                  <MapPin size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Manual</span>
                </button>
              </div>
            </div>

            <button
              disabled={isLoading || (!content.trim() && selectedFiles.length === 0)}
              type="submit"
              className="bg-accent text-white px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
