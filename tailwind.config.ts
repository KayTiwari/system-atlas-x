import type { Config } from "tailwindcss";

/**
 * Light, premium-minimal theme (inspired by tresmarescapital.com): warm
 * off-white paper, dark ink text, restrained evergreen earth-tone accent,
 * generous whitespace. The existing `navy` / `brand` token NAMES are kept but
 * remapped to light values so component classes flip theme centrally.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // surfaces & lines (light)
        navy: {
          950: "#ffffff",
          900: "#ffffff", // pure white surfaces: sidebars, inputs, modals
          800: "#f1eee7", // faint warm tint: cards, node bodies, hovers
          700: "#e4dfd4", // hairline borders, chips, secondary buttons
          600: "#d6d0c2", // hover borders
        },
        // restrained earth-tone accent
        brand: {
          blue: "#1f4d44", // accent (borders, rings, shadows)
          cyan: "#2f6b5e", // accent text
          "blue-dark": "#163a33",
        },
        paper: {
          DEFAULT: "#f7f5f0",
          soft: "#efeae1",
        },
        ink: {
          DEFAULT: "#1c1b19",
          soft: "#403d37",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1f4d44 0%, #2f6b5e 100%)",
        "gradient-dark": "linear-gradient(180deg, #f7f5f0 0%, #efeae1 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
