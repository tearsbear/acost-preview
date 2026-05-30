/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-surface-elevated)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        border: "var(--border-color)",
        "border-strong": "var(--border-color-strong)",
        accent: "var(--accent-color)",
        "accent-link": "var(--accent-link)",
        "accent-wash": "var(--accent-wash)",
        "accent-badge": "var(--accent-badge)",
        success: "var(--success-color)",
      },
      boxShadow: {
        fuser: "var(--shadow-main)",
      },
    },
  },
  plugins: [],
};
