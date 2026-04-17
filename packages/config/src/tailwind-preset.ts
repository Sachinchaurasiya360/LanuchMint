import type { Config } from "tailwindcss";
import { colors, fonts, radius, shadows } from "./brand.js";

const preset: Partial<Config> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        yellow: colors.brand.yellow,
        zinc: colors.zinc,
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        danger: colors.semantic.danger,
        info: colors.semantic.info,
        background: colors.brand.white,
        foreground: colors.zinc[900],
        muted: {
          DEFAULT: colors.zinc[100],
          foreground: colors.zinc[500],
        },
        border: colors.zinc[200],
        ring: colors.brand.yellow[400],
        primary: {
          DEFAULT: colors.brand.yellow[400],
          foreground: colors.zinc[900],
        },
        secondary: {
          DEFAULT: colors.zinc[100],
          foreground: colors.zinc[900],
        },
        destructive: {
          DEFAULT: colors.semantic.danger,
          foreground: colors.brand.white,
        },
      },
      fontFamily: {
        sans: fonts.sans,
        mono: fonts.mono,
      },
      borderRadius: {
        sm: radius.sm,
        DEFAULT: radius.md,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
      },
      boxShadow: {
        sm: shadows.sm,
        DEFAULT: shadows.md,
        md: shadows.md,
        lg: shadows.lg,
      },
    },
  },
  plugins: [],
};

export default preset;
