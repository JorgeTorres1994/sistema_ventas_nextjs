"use client";

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const AuthButton = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  fullWidth = true,
  className, 
  ...props 
}: AuthButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md hover:shadow-lg active:scale-[0.98]",
    outline: "border border-outline-variant/40 hover:bg-surface-low text-on-surface",
    ghost: "text-primary hover:underline",
  };

  return (
    <button
      className={cn(
        "h-12 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
        fullWidth ? "w-full" : "px-6",
        variants[variant],
        isLoading && "opacity-70 pointer-events-none",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          {children}
          {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default AuthButton;
