import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingComponent: React.FC<LoadingProps> = ({
  fullScreen = false,
  size = 'md',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
      />
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
};

const SkeletonComponent: React.FC<{ className?: string; count?: number }> = ({ 
  className = '', 
  count = 1 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`bg-gray-200 rounded h-16 ${className}`}
        />
      ))}
    </div>
  );
};

// Export as compound component
export const Loading = Object.assign(LoadingComponent, {
  Skeleton: SkeletonComponent
});

export const Skeleton = SkeletonComponent;
