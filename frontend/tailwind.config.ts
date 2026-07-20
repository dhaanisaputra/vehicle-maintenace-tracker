import type { Config } from "tailwindcss";

/**
 * Helper: expose a CSS variable as a Tailwind color that supports
 * opacity modifiers (e.g. bg-primary/10).
 */
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          hover: withOpacity("--color-primary-hover"),
          soft: withOpacity("--color-primary-soft"),
          fg: withOpacity("--color-on-primary"),
        },
        text: {
          DEFAULT: withOpacity("--color-text"),
          muted: withOpacity("--color-text-muted"),
          subtle: withOpacity("--color-text-subtle"),
        },
        surface: {
          DEFAULT: withOpacity("--color-surface"),
          muted: withOpacity("--color-surface-muted"),
        },
        background: withOpacity("--color-background"),
        border: {
          DEFAULT: withOpacity("--color-border"),
          strong: withOpacity("--color-border-strong"),
        },
        danger: {
          DEFAULT: withOpacity("--color-danger"),
          soft: withOpacity("--color-danger-soft"),
        },
        success: withOpacity("--color-success"),
        warning: withOpacity("--color-warning"),
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        // constrained scale (calm, limited hierarchy)
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.375rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.75rem", { lineHeight: "2.125rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      borderRadius: {
        // medium radius: calm, slightly modern
        sm: "0.375rem",
        DEFAULT: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        // subtle elevation only
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        sm: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        md: "0 4px 12px -2px rgb(15 23 42 / 0.08)",
        sheet: "0 -8px 30px -8px rgb(15 23 42 / 0.12)",
      },
      maxWidth: {
        // content column widths (mobile-first, capped on desktop)
        content: "42rem",
        app: "72rem",
      },
      keyframes: {
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "sheet-up": "sheet-up 0.24s cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
