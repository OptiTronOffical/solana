/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        phantom: {
          purple: '#7B61FF',
          dark: '#0A0B1F',
          darker: '#060714',
          light: '#AB9FF2',
        },
        background: '#0A0B1F',
        foreground: '#FFFFFF',
      },
    },
  },
  plugins: [],
  }
