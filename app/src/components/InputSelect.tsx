import React, { forwardRef } from 'react';
import { Icon, type IconName } from './';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: InputSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  label?: string;
  options: { label: string; value: string | number }[];
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

export const InputSelect = forwardRef<HTMLSelectElement, InputSelectProps>(({
  size = 'md',
  icon,
  iconPosition = 'left',
  error,
  helperText,
  fullWidth = false,
  label,
  className = '',
  disabled,
  options,
  ...props
}, ref) => {
  const baseInputStyles = 'block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] transition-colors duration-200';
  const inputStyles = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]';

  const widthClass = fullWidth ? 'w-full' : '';

  const selectElement = (
    <div className={`relative ${widthClass}`}>
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name={icon} size={iconSizeStyles[size]} className="text-gray-400" />
        </div>
      )}
      <select
        ref={ref}
        className={`${baseInputStyles} ${inputStyles} ${sizeStyles[size]} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className} appearance-none`}
        disabled={disabled}
        {...props}
      >
        {/* Option vide si nécessaire */}
        <option value="">Sélectionner...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* Flèche d'indication dropdown */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
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

      {selectElement}

      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

InputSelect.displayName = 'InputSelect';

