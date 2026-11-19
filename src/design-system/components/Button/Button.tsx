import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

export function Button({ variant = 'primary', block = false, className, type = 'button', ...rest }: ButtonProps) {
  const classes = ['ds-button', `ds-button--${variant}`, block && 'ds-button--block', className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...rest} />;
}
