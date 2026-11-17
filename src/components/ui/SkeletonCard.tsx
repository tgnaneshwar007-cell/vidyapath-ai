import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-brand-border/60 bg-white/70 p-5 shadow-card space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-md skeleton-shimmer" />
        <div className="h-4 w-16 rounded-md skeleton-shimmer" />
      </div>

      <div className="space-y-2">
        <div className="h-5 w-4/5 rounded-md skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
      </div>

      <div className="space-y-1.5 pt-2">
        <div className="h-3 w-full rounded skeleton-shimmer" />
        <div className="h-3 w-5/6 rounded skeleton-shimmer" />
      </div>

      <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between">
        <div className="h-4 w-20 rounded-md skeleton-shimmer" />
        <div className="h-7 w-24 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
};
