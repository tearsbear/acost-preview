"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check current active class on mounting
    const root = document.getElementById("theme-root");
    const isDark = root && root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = document.getElementById("theme-root");
    if (!root) return;

    if (theme === "light") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="button-spring p-2 rounded-lg bg-surface hover:bg-elevated border border-border text-muted hover:text-primary flex items-center justify-center shadow-sm"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {theme === "light" ? (
        <Moon className="w-4.5 h-4.5 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="w-4.5 h-4.5 transition-transform hover:rotate-45" />
      )}
    </button>
  );
}
