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
        aura: "#c7ff32",
        surface: "#111111",
      },
      boxShadow: {
        aura: "0 0 50px rgba(199,255,50,.16)",
      },
    },
  },
  plugins: [],
};

export default config;
