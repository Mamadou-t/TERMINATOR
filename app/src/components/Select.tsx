import React, { forwardRef } from 'react';
import { Icon } from './';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  label?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  size = 'md',
  options,
  placeholder,
  error,
  helperText,
  fullWidth = false,
  label,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseSelectStyles = 'block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] transition-colors duration-200 bg-white';
  const selectStyles = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]';

  const widthClass = fullWidth ? 'w-full' : '';

  const selectElement = (
    <div className={`relative ${widthClass}`}>
      <select
        ref={ref}
        className={`${baseSelectStyles} ${selectStyles} ${sizeStyles[size]} pr-10 ${className}`}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <Icon name="chevron-down" size="sm" className="text-gray-400" />
      </div>
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

Select.displayName = 'Select';