import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { ButtonVariant, InputSize } from '../../enums';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | string;
  size?: InputSize | string;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  as?: any;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  fullWidth?: boolean;
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
  fullWidth = false,
  as: Component = 'button',
  ...props
}, ref) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    fullWidth && 'btn--full-width',
    className
  ].filter(Boolean).join(' ');

  const hasIconOnly = icon && !children;
  const hasIconAndText = icon && children;

  return (
    <Component
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true" />
      )}
      {icon && !loading && (
        <span className={`btn__icon ${hasIconOnly ? 'btn__icon--only' : ''}`} aria-hidden="true">
          {icon}
        </span>
      )}
      {children && (
        <span className={`btn__text ${hasIconAndText ? 'btn__text--with-icon' : ''}`}>
          {children}
        </span>
      )}
    </Component>
  );
}));

Button.displayName = 'Button';

export default Button;