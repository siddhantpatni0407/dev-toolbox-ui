import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { ButtonVariant, InputSize } from '../../enums';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: InputSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  as?: any;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  [key: string]: any;
}

const Button = React.memo(forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = ButtonVariant.PRIMARY,
  size = InputSize.MEDIUM,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  as: Component = 'button',
  ...props
}, ref) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      <span className="btn-text">{children}</span>
    </Component>
  );
}));

Button.displayName = 'Button';

export default Button;