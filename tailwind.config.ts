import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        secondary: {
          50: "#fdf8f3",
          100: "#f7ecdf",
          200: "#eed9bf",
          300: "#e1bd90",
          400: "#d1a06b",
          500: "#c08a52",
          600: "#a37142",
          700: "#7f5735",
          800: "#63432b",
          900: "#4f3623",
        },
      },
    },
  },
  plugins: [],
};
export default config;
