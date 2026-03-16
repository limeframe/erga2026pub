import type { Config } from "tailwindcss";

// Χρώματα brand — αλλάξτε εδώ για ολόκληρη την εφαρμογή
const primary = "#233053";
const primaryDark = "#0e1e3a";
const primaryLight = "#036EC5";
const secondary = "#9BC2E3";
const tertiary = "#D76F3E";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: primary,
          dark: primaryDark,
          light: primaryLight,
        },
        secondary: {
          DEFAULT: secondary,
        },
        tertiary: {
          DEFAULT: tertiary,
        },
        ppelgrey: "#E4DCD1",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": `linear-gradient(135deg, ${primary} 0%, ${primaryLight} 100%)`,
      },
    },
  },
  plugins: [],
};

export default config;
