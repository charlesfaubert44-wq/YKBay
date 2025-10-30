import React from 'react';

const Card = ({
  children,
  variant = 'default',
  hover = false,
  className = '',
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-card transition-all duration-300';

  const variants = {
    default: 'bg-midnight-navy/90 border border-aurora-teal/20 shadow-elevation-2 backdrop-blur-sm',
    glass: 'bg-frost-white/5 border border-frost-white/10 shadow-elevation-3 backdrop-blur-md',
    aurora: 'bg-gradient-to-br from-aurora-teal/10 via-aurora-purple/10 to-aurora-blue/10 border border-aurora-teal/30 shadow-aurora backdrop-blur-sm',
    solid: 'bg-midnight-navy border border-arctic-ice/30 shadow-elevation-2',
    elevated: 'bg-midnight-navy/95 border border-aurora-teal/20 shadow-elevation-3 backdrop-blur-md',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverStyles = hover
    ? 'hover:shadow-elevation-3 hover:scale-[1.02] hover:border-aurora-teal/50 cursor-pointer'
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
