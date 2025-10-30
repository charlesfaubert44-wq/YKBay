import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseStyles = 'input-northern transition-all duration-200';
  const widthClass = fullWidth ? 'w-full' : '';
  const errorStyles = error ? 'border-safety-critical focus:ring-safety-critical' : 'border-stone-grey focus:border-aurora-teal focus:ring-aurora-teal';

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-arctic-ice">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-grey">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={`${baseStyles} ${widthClass} ${errorStyles} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-grey">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-safety-critical font-medium">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-stone-grey">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
