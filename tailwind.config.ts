import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C5DD3",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#C4F250",
          foreground: "#11142D",
        },
        secondary: {
          DEFAULT: "#E4E1F8",
          foreground: "#11142D",
        },
        background: "#FFFFFF",
        foreground: "#11142D",
        card: {
          DEFAULT: "#F7F7FB",
          foreground: "#11142D",
        },
        muted: {
          DEFAULT: "#F7F7FB",
          foreground: "#808191",
        },
        border: "#E4E1F8",
        input: "#F7F7FB",
        ring: "#6C5DD3",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#11142D",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
