"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  BookOpen,
  LayoutDashboard,
  Key,
  LogOut,
  Route,
  Terminal,
  User,
  ScrollText,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
      }
    });
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect triggers a full page reload to clear in-memory client state completely (Security Guidelines)
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Onboarding", href: "/dashboard/onboarding", icon: Route },
    { name: "Logs", href: "/dashboard/logs", icon: ScrollText },
    { name: "API Keys", href: "/dashboard/keys", icon: Key },
    { name: "Playground", href: "/dashboard/playground", icon: Terminal },
    { name: "API Docs", href: "/docs", icon: BookOpen },
  ];

  // Mask PII (Email) safely for rendering (Security Guidelines)
  const maskEmail = (email: string | null) => {
    if (!email) return "developer@acost.co";
    const [local, domain] = email.split("@");
    if (local.length <= 3) return `***@${domain}`;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  return (
    <div className="flex min-h-screen bg-canvas text-primary transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between p-6 fixed h-full z-20 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-canvas font-bold font-display shadow-sm">
              a
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-primary">
              acost<span className="text-accent">.</span>
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent-wash text-accent font-semibold border border-accent/25"
                      : "text-muted hover:text-primary hover:bg-elevated/40 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info / Logout */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-3 px-3 py-2 bg-canvas rounded-md border border-border mb-3.5">
            <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-secondary">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-muted font-bold tracking-wider uppercase">
                Developer
              </p>
              <p
                className="text-xs text-secondary font-medium truncate"
                title={userEmail ?? ""}
              >
                {maskEmail(userEmail)}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full button-spring flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-muted hover:text-red-500 hover:bg-red-500/5 border border-transparent"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-surface px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-2 text-muted text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-accent" />
            <span>Telemetry Pipeline ACTIVE</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
