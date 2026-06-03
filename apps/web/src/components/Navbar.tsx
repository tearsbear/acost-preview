"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User | null;
  allowRegister?: boolean;
}

export function Navbar({ user, allowRegister = true }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-canvas/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas font-bold font-display shadow-sm">
              a
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary">
              acost<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <Link href="/#features" className="hover:text-primary transition-all duration-300 relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/providers" className="hover:text-primary transition-all duration-300 relative group">
            Providers
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/docs" className="hover:text-primary transition-all duration-300 relative group">
            Docs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/#whitelist" className="hover:text-primary transition-all duration-300 relative group">
            Whitelist
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="button-spring px-4 py-2 bg-accent text-canvas rounded-full text-sm font-semibold shadow-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                Sign In
              </Link>
              {allowRegister && (
                <Link
                  href="/signup"
                  className="button-spring px-4 py-2 bg-accent text-canvas rounded-full text-sm font-semibold shadow-sm"
                >
                  Get Started
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
