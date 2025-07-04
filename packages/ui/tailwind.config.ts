import type { Config } from "tailwindcss";
import * as nodePath from "path";
const join = nodePath.join;

const config = {
  darkMode: ["class"],
  content: [
    // Pacote UI
    join(__dirname, "src/**/*.{ts,tsx}"),
    // Aplicativo Web
    join(__dirname, "../../apps/web/app/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/web/components/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/web/pages/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/shop/app/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/shop/components/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/shop/pages/**/*.{ts,tsx}"),

    join(__dirname, "../../apps/admin/app/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/admin/components/**/*.{ts,tsx}"),
    join(__dirname, "../../apps/admin/pages/**/*.{ts,tsx}"),
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        "banner-gradient": "radial-gradient(ellipse at 30% 50%, #293c59 0%, #253551 30%, #1e2b47 60%, #18243d 100%)",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)"],
        mono: ["var(--font-mono)"],
        barlow: ["var(--font-barlow)"],
      },
      height: {
        screen: "100vh",
        "screen-small": "100svh",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Class categories colors
        terrestre: {
          DEFAULT: "#ffa752",
          50: "#fff8f0",
          100: "#fff0e0",
          200: "#ffddb7",
          300: "#ffc483",
          400: "#ffa752", // Base color
          500: "#ff8c20",
          600: "#ff7a0d",
          700: "#e06600",
          800: "#b85200",
          900: "#944200",
        },
        aqua: {
          DEFAULT: "#7e8da2",
          50: "#f4f6f8",
          100: "#e8ecf0",
          200: "#d1d8e2",
          300: "#b2bfce",
          400: "#7e8da2", // Base color
          500: "#697b94",
          600: "#586580",
          700: "#485267",
          800: "#3e4658",
          900: "#363d4a",
        },
        xpress: {
          DEFAULT: "#a7a7a7",
          50: "#f8f8f8",
          100: "#f0f0f0",
          200: "#e4e4e4",
          300: "#d1d1d1",
          400: "#a7a7a7", // Base color
          500: "#949494",
          600: "#787878",
          700: "#636363",
          800: "#515151",
          900: "#454545",
        },
        primary: {
          DEFAULT: "#293c59",
          foreground: "hsl(var(--primary-foreground))",
          light: "#3e5a86",
        },
        secondary: {
          DEFAULT: "#ffa752",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        scroll: "scroll var(--animation-duration, 100s) var(--animation-direction, forwards) linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    keyframes: {
      scroll: {
        to: {
          transform: "translate(calc(-50% - 0.5rem))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
