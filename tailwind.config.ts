import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#EBE6DC",
        ivory: {
          DEFAULT: "#F3EEE4",
          soft: "#F7F3EA",
          deep: "#E2DACB",
        },
        teal: {
          DEFAULT: "#2F6F6A",
          deep: "#1B4542",
          soft: "#5A9A94",
          mist: "#D3E4E1",
        },
        sage: {
          DEFAULT: "#8FA68A",
          soft: "#C5D4C1",
          deep: "#5F735C",
        },
        amber: {
          DEFAULT: "#8CB5A7",
          soft: "#C5DDD4",
          deep: "#5A8578",
        },
        ink: {
          DEFAULT: "#161C1B",
          muted: "#4A5552",
          soft: "#6B7773",
        },
      },
      fontFamily: {
        display: [
          "var(--font-variable)",
          "var(--font-display)",
          "Georgia",
          "serif",
        ],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.03em",
        wideish: "0.12em",
      },
    },
  },
  plugins: [],
};

export default config;
