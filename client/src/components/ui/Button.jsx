import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target';

  const variants = {
    primary: 'bg-gradient-to-r from-aurora-green to-forest-green text-ice-white hover:shadow-aurora hover:scale-105 active:scale-95 focus:ring-aurora-green',
    secondary: 'bg-midnight-blue text-ice-blue border-2 border-ice-blue hover:bg-midnight-dark hover:border-aurora-blue active:scale-95 focus:ring-aurora-blue',
    danger: 'bg-safety-red text-ice-white hover:bg-red-700 hover:shadow-lg active:scale-95 focus:ring-safety-red',
    outline: 'bg-transparent border-2 border-aurora-green text-aurora-green hover:bg-aurora-green hover:text-ice-white active:scale-95 focus:ring-aurora-green',
    ghost: 'bg-transparent text-ice-blue hover:bg-ice-white/10 active:bg-ice-white/20 focus:ring-ice-blue',
    aurora: 'bg-gradient-to-r from-aurora-green via-aurora-purple to-aurora-blue text-ice-white hover:shadow-2xl hover:scale-105 active:scale-95 focus:ring-aurora-purple animate-gradient',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-2xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
