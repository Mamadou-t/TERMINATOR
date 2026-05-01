import React, { forwardRef } from 'react';
import { Icon, type IconName } from './';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  label?: string;
  type?: string;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
};

const iconSizeStyles: Record<InputSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'md'
};

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(({
  size = 'md',
  icon,
  iconPosition = 'left',
  error,
  helperText,
  fullWidth = false,
  label,
  className = '',
  disabled,
  type = '',
  ...props
}, ref) => {
  const baseInputStyles = 'block w-full border rounded-md shadow-sm placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] transition-colors duration-200';
  const inputStyles = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]';

  const widthClass = fullWidth ? 'w-full' : '';

  const inputElement = (
    <div className={`relative ${widthClass}`}>
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name={icon} size={iconSizeStyles[size]} className="text-gray-400" />
        </div>
      )}

      <input
      type={type}
        ref={ref}
        className={`${baseInputStyles} ${inputStyles} ${sizeStyles[size]} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`}
        disabled={disabled}
        {...props}
      />

      {icon && iconPosition === 'right' && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Icon name={icon} size={iconSizeStyles[size]} className="text-gray-400" />
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-1 ${widthClass}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {inputElement}

      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

InputText.displayName = 'InputText';