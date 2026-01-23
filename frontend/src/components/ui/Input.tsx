import type { InputHTMLAttributes, ReactNode} from 'react';
import { forwardRef } from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  helperText?: string;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      helperText,
      isPassword = false,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine input type
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Base classes
    const baseClasses = 'w-full px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2';

    // State classes
    const stateClasses = error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-primary focus:border-primary';

    // Disabled classes
    const disabledClasses = disabled
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
      : 'bg-white text-gray-900';

    // Icon padding
    const iconPadding = leftIcon ? 'pl-11' : '';

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            type={inputType}
            className={`
              ${baseClasses}
              ${stateClasses}
              ${disabledClasses}
              ${iconPadding}
              ${className}
            `}
            disabled={disabled}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || error) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;