/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DesignTokens } from './tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const wrapperClasses = `w-full flex flex-col gap-1.5 font-sans`.trim();

    const inputClasses = `
      w-full outline-none transition-all duration-200
      ${DesignTokens.colors.input.bg}
      ${DesignTokens.colors.input.text}
      ${DesignTokens.colors.input.placeholder}
      ${DesignTokens.radius.input}
      ${DesignTokens.spacing.input}
      border
      ${error 
        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
        : `${DesignTokens.colors.input.border} focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400`
      }
      ${DesignTokens.typography.sizes.base}
      ${leftIcon ? 'pl-11' : ''}
      ${rightIcon ? 'pr-11' : ''}
      ${DesignTokens.accessibility.focusRing}
    `.replace(/\s+/g, ' ').trim();

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {/* Left Icon Slot */}
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`${inputClasses} ${className}`}
            {...props}
          />

          {/* Right Icon Slot */}
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Form Error or Helper Text */}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-500 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-zinc-500 dark:text-zinc-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
