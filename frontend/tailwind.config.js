/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBF8F3",
        ink: "#262421",
        primary: {
          DEFAULT: "#2F6F6B",
          dark: "#204F4C",
          light: "#DCEBE9",
        },
        accent: {
          DEFAULT: "#EDA85A",
          soft: "#FBE3C0",
        },
        status: {
          belum: "#D9695F",
          proses: "#E8B84B",
          selesai: "#5FA777",
        },
        line: "#E7E1D6",
      },
      fontFamily: {
        display: ["var(--font-baloo)", "ui-rounded", "sans-serif"],
        body: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
