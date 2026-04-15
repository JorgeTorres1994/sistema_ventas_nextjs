"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import AuthInput from '@/components/ui/AuthInput';
import AuthButton from '@/components/ui/AuthButton';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000); // Demo loading state
  };

  // Basic password strength logic based on length for visual demo
  const getStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 4;
  };

  const strength = getStrength();

  return (
    <main className="min-h-screen flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#f9f9ff]">
      {/* Background Elements for Atmospheric Depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        {/* Branding/Logo Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                architecture
              </span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">ArchitectSaaS</span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-surface-lowest rounded-xl shadow-[0px_12px_32px_rgba(20,27,43,0.04)] overflow-hidden border border-outline-variant/5">
          {/* Visual Header */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>
          
          <div className="p-8 md:p-10">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create your workspace</h1>
              <p className="text-on-surface-variant text-sm">Join the digital architect ecosystem and scale your logistics workflow.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthInput
                id="full_name"
                label="Full Name"
                icon="person"
                placeholder="Alex Rivera"
              />

              <AuthInput
                id="email"
                label="Email Address"
                icon="mail"
                type="email"
                placeholder="alex@company.com"
              />

              <div className="space-y-1.5">
                <AuthInput
                  id="password"
                  label="Password"
                  icon="lock"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Password Strength Indicator */}
                <div className="px-1 pt-1">
                  <div className="flex gap-1 h-1 mb-2">
                    <div className={`flex-1 rounded-full transition-colors duration-500 ${strength >= 1 ? 'bg-primary' : 'bg-surface-low'}`}></div>
                    <div className={`flex-1 rounded-full transition-colors duration-500 ${strength >= 2 ? 'bg-primary' : 'bg-surface-low'}`}></div>
                    <div className={`flex-1 rounded-full transition-colors duration-500 ${strength >= 3 ? 'bg-primary' : 'bg-surface-low'}`}></div>
                    <div className={`flex-1 rounded-full transition-colors duration-500 ${strength >= 4 ? 'bg-primary' : 'bg-surface-low'}`}></div>
                  </div>
                  <span className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">info</span>
                    Strong: Use at least 8 characters with numbers.
                  </span>
                </div>
              </div>

              <AuthInput
                id="confirm_password"
                label="Confirm Password"
                icon="verified_user"
                type="password"
                placeholder="••••••••"
              />

              <div className="pt-4">
                <AuthButton 
                  type="submit" 
                  isLoading={isLoading} 
                  disabled={password.length === 0}
                  className={password.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-100" : ""}
                >
                  Create Account
                </AuthButton>

                <p className="mt-4 text-center text-on-surface-variant text-sm">
                  Already have an account? 
                  <Link href="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-4">Trusted by industry leaders</p>
          <div className="flex justify-center items-center gap-6 opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            <div className="h-6 w-20 bg-on-surface-variant rounded-sm flex items-center justify-center text-[10px] text-white font-bold">LOGISTICS</div>
            <div className="h-6 w-20 bg-on-surface-variant rounded-sm flex items-center justify-center text-[10px] text-white font-bold">RETAIL CO</div>
            <div className="h-6 w-20 bg-on-surface-variant rounded-sm flex items-center justify-center text-[10px] text-white font-bold">WAREHOUSE</div>
          </div>
        </div>
      </div>
      
      {/* Footer (Simplified as in design) */}
      <footer className="absolute bottom-12 w-full px-8 flex flex-col md:flex-row justify-between items-center text-[0.75rem] text-on-surface-variant opacity-60">
        <p>© 2024 Digital Architect. All rights reserved.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          <Link href="#" className="hover:text-foreground">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
