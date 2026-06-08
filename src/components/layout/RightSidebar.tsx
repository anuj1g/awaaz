import React from 'react';
import { TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RightSidebarProps {
  onCategoryFilter: (category: string) => void;
  activeCategory: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onCategoryFilter, activeCategory }) => {
  const trendingIssues = [
    'Climate Action',
    'Human Rights',
    'Education Reform',
    'Global Health',
    'Poverty Alleviation',
    'Justice System'
  ];

  return (
    <aside className="w-80 h-[calc(100vh-64px)] fixed right-0 top-16 bg-background border-l border-border-subtle p-6 overflow-y-auto hidden lg:block">
      <div className="space-y-8">
        <div className="bg-card border border-border-subtle rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={18} className="text-accent" />
            <h3 className="font-bold text-text-muted uppercase tracking-widest text-[10px]">Trending Issues</h3>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryFilter('')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                activeCategory === '' ? "bg-accent/10 text-accent font-bold" : "hover:bg-white/5 text-text-muted"
              )}
            >
              # All Topics
            </button>
            {trendingIssues.map((issue) => (
              <button
                key={issue}
                onClick={() => onCategoryFilter(issue)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all border border-transparent",
                  activeCategory === issue ? "bg-accent/10 text-accent font-bold border-accent/20" : "hover:bg-white/5 text-text-muted"
                )}
              >
                <div className="flex justify-between items-center">
                  <span># {issue}</span>
                  <span className="text-[10px] opacity-50 font-normal">Trending</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-accent-glow rounded-xl p-5 border border-accent/30">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle size={18} className="text-accent" />
            <h3 className="font-bold text-accent text-xs uppercase tracking-widest">Support Needed</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-background/40 p-3 rounded-lg border border-accent/20">
              <p className="text-xs font-bold text-text-main">Emergency Blood Donation</p>
              <p className="text-[10px] text-text-muted mt-1">City Hospital - O Negative urgent requirement.</p>
              <button className="mt-3 w-full text-[10px] bg-accent text-white py-2 rounded-lg font-bold shadow-lg shadow-accent/20">Help Now</button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-subtle rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb size={18} className="text-accent" />
            <h3 className="font-bold text-text-muted text-[10px] uppercase tracking-widest">Awareness Tips</h3>
          </div>
          <div className="space-y-4">
            <p className="text-[12px] text-text-muted leading-relaxed">
              Verify all local news sources before sharing to prevent misinformation in our community feed. Always cite official reports.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
