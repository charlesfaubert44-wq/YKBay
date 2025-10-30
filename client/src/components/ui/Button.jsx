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
    primary: 'bg-aurora-teal text-frost-white hover:bg-aurora-teal/90 hover:shadow-aurora hover:scale-105 active:scale-95 focus:ring-aurora-teal',
    secondary: 'bg-transparent text-aurora-teal border-2 border-aurora-teal hover:bg-aurora-teal/10 active:scale-95 focus:ring-aurora-teal',
    danger: 'bg-safety-critical text-frost-white hover:bg-safety-critical/90 hover:shadow-lg active:scale-95 focus:ring-safety-critical',
    outline: 'bg-transparent border-2 border-arctic-ice text-arctic-ice hover:bg-arctic-ice/10 active:scale-95 focus:ring-arctic-ice',
    ghost: 'bg-transparent text-arctic-ice hover:bg-frost-white/10 active:bg-frost-white/20 focus:ring-arctic-ice',
    aurora: 'bg-gradient-to-r from-aurora-teal via-aurora-purple to-aurora-blue text-frost-white hover:shadow-2xl hover:scale-105 active:scale-95 focus:ring-aurora-purple animate-gradient',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-button',
    md: 'px-4 py-2 text-base rounded-button',
    lg: 'px-6 py-3 text-lg rounded-button',
    xl: 'px-8 py-4 text-xl rounded-button',
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
