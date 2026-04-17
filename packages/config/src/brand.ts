/**
 * LaunchMint brand tokens.
 * Mandate: white + yellow only as brand. No gradients. No emojis.
 * Single source of truth — consumed by tailwind preset, email templates, charts.
 */

export const brand = {
  name: "LaunchMint",
  tagline: "Turn visibility into velocity.",
  url: "https://launchmint.com",
  email: "hello@launchmint.com",
} as const;

export const colors = {
  brand: {
    yellow: {
      50: "#FEFCE8",
      100: "#FEF9C3",
      200: "#FEF08A",
      300: "#FDE047",
      400: "#FACC15",
      500: "#EAB308",
      600: "#CA8A04",
      700: "#A16207",
      800: "#854D0E",
      900: "#713F12",
    },
    white: "#FFFFFF",
  },
  zinc: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B",
  },
  semantic: {
    success: "#16A34A",
    warning: "#EAB308",
    danger: "#DC2626",
    info: "#0EA5E9",
  },
} as const;

export const fonts = {
  sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  mono: ["JetBrains Mono", "ui-monospace", "monospace"],
} as const;

export const radius = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
  lg: "0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)",
} as const;
