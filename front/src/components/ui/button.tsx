'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'md', 
    className = '', 
    ...props 
  }, ref) => {
    const baseStyles = "rounded font-medium focus:outline-none transition-colors";
    
    const variantStyles = {
      default: "bg-[#f59e0b] hover:bg-[#d97706] text-[#451a03] shadow",
      outline: "bg-transparent border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b]/10",
      secondary: "bg-[#4B5563] hover:bg-[#374151] text-white"
    };
    
    const sizeStyles = {
      sm: "text-xs px-3 py-1",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3"
    };
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    
    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
