import React from 'react';
import { Icon, type IconName } from './';
import { IconButton } from './IconButton';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  icon?: IconName;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const iconMap: Record<AlertVariant, IconName> = {
  success: 'check-circle',
  warning: 'alert',
  error: 'x-circle',
  info: 'info'
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  icon,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const baseStyles = 'border rounded-md p-4 flex items-start space-x-3';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <div className="flex-shrink-0">
        <Icon
          name={icon || iconMap[variant]}
          size="md"
          className="text-current"
        />
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-medium mb-1">
            {title}
          </h4>
        )}
        <p className="text-sm">
          {message}
        </p>
      </div>

      {dismissible && onDismiss && (
        <div className="flex-shrink-0">
          <IconButton
            icon="x"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-current hover:bg-black hover:bg-opacity-10"
          />
        </div>
      )}
    </div>
  );
};