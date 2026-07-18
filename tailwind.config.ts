import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        asphalt: "#09090b",
        carbon: "#111217",
        gdBg: "#0B0A0E",
        gdText: "#EDE9E0",
        gdGold: "#D4A843",
        gdCyan: "#5FBFCA",
        gdHot: "#E05C2A",
        gdLine: "rgba(237,233,224,0.04)",
        neonRed: "#ff2e2e",
        neonAmber: "#ffb020",
        pitGreen: "#19f38b"
      }
    }
  },
  plugins: []
};
export default config;
