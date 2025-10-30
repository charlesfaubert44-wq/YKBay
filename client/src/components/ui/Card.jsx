import React from 'react';

const Card = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';

  const variants = {
    default: 'bg-midnight-blue/90 border border-ice-blue/20 shadow-lg backdrop-blur-sm',
    glass: 'bg-ice-white/5 border border-ice-white/10 shadow-xl backdrop-blur-md',
    aurora: 'bg-gradient-to-br from-aurora-green/10 via-aurora-purple/10 to-aurora-blue/10 border border-aurora-blue/30 shadow-aurora backdrop-blur-sm',
    solid: 'bg-midnight-dark border border-ice-blue/30 shadow-lg',
    elevated: 'bg-midnight-blue/95 border border-ice-blue/20 shadow-2xl backdrop-blur-md',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverStyles = hover
    ? 'hover:shadow-2xl hover:scale-[1.02] hover:border-aurora-blue/50 cursor-pointer'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
