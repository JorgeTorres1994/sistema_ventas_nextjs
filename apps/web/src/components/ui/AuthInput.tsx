"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  successIcon?: boolean;
  rightElement?: React.ReactNode;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, successIcon, rightElement, className, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label 
          htmlFor={id} 
          className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1"
        >
          {label}
        </label>
        <div className="relative group">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-lg">
              {icon}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "w-full h-12 bg-surface-low border-0 rounded-xl text-on-surface text-sm transition-all duration-200 outline-none",
              "focus:ring-2 focus:ring-primary focus:bg-surface-lowest",
              icon ? "pl-11" : "px-4",
              rightElement || successIcon ? "pr-11" : "px-4",
              className
            )}
            {...props}
          />
          {successIcon && (
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-emerald-500">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          )}
          {rightElement && (
            <div className="absolute inset-y-0 right-4 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
