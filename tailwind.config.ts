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
        brand: {
          50: "#eefbf4",
          100: "#d6f5e3",
          200: "#b0eccb",
          300: "#7bdead",
          400: "#41c68b",
          500: "#1baa71",
          600: "#0f8a5a",
          700: "#0d6e4a",
          800: "#0d573c",
          900: "#0c4832",
          950: "#04281c",
        },
        navy: {
          800: "#0f2038",
          900: "#0b1728",
          950: "#070e1a",
        }
      },
    },
  },
  plugins: [],
};
export default config;
