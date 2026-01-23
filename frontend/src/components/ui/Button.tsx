import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400 disabled:text-gray-300 disabled:cursor-not-allowed'
  };

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2 text-base gap-2',
    large: 'px-6 py-3 text-lg gap-2.5'
  };

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Disabled state
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <Loader2 className="animate-spin" size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
      )}

      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="inline-flex">{leftIcon}</span>
      )}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className="inline-flex">{rightIcon}</span>
      )}
    </button>
  );
}