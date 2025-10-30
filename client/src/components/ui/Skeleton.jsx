import React from 'react';

const Skeleton = ({ className = '', variant = 'default', ...props }) => {
  const baseStyles = 'animate-pulse bg-ice-white/10 rounded';

  const variants = {
    default: '',
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    circle: 'rounded-full',
    card: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

// Skeleton components for common patterns
export const SkeletonCard = () => (
  <div className="card p-6 space-y-4">
    <Skeleton variant="title" />
    <Skeleton variant="text" />
    <Skeleton variant="text" className="w-2/3" />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-ice-white/5">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonMap = () => (
  <div className="w-full h-full min-h-[400px] bg-ice-white/5 rounded-xl animate-pulse flex items-center justify-center">
    <div className="text-ice-blue/50 text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-aurora-blue/30 border-t-aurora-blue rounded-full animate-spin" />
      <p className="font-medium">Loading map...</p>
    </div>
  </div>
);

export default Skeleton;
