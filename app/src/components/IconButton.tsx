import React from 'react';
import { Icon, type IconName } from './';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: IconName;
  tooltip?: string;
  loading?: boolean;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary: 'bg-[#1e3a5f] hover:bg-[#2a4a6b] text-white border border-[#1e3a5f] hover:border-[#2a4a6b]',
  secondary: 'bg-[#E0E6EF] hover:bg-[#d4dbe3] text-[#1e3a5f] border border-[#E0E6EF] hover:border-[#d4dbe3]',
  outline: 'bg-transparent hover:bg-[#1e3a5f] text-[#1e3a5f] hover:text-white border border-[#1e3a5f]',
  ghost: 'bg-transparent hover:bg-[#ffffff10] text-[#1e3a5f] border border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700'
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3'
};

const iconSizeStyles: Record<IconButtonSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg'
};

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  icon,
  tooltip,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Icon name={icon} size={iconSizeStyles[size]} />
      )}
    </button>
  );
};