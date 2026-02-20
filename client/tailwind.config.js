import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloom-primary': '#c896f4ff',   // lavender purple
        'bloom-secondary': '#E6CFEA', // soft mauve
        'bloom-cream': '#F8F6FA',     // warm off-white
        'bloom-dark': '#2F2F35',      // dark text
        'bloom-muted': '#4A4A52',     // body text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      boxShadow: {
        soft: '0 12px 30px rgba(139,127,184,0.12)',
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        bloom: {
          "primary": "#d17cf5ff",
          "secondary": "#E6CFEA",
          "accent": "#F8F6FA",
          "neutral": "#2F2F35",
          "base-100": "#ebd8d8ff",
          "base-200": "#f5e6e6", // Slightly darker than base-100
          "base-content": "#2F2F35", // Dark text for light mode
          "head": "#1a1a2e",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        "bloom-dark": {
          "primary": "#c896f4",
          "secondary": "#4a3b52",
          "accent": "#2F2F35",
          "neutral": "#ebd8d8",
          "base-100": "#1a1a1a", // Deep dark background
          "base-200": "#252525", // Slightly lighter for cards
          "base-content": "#ebd8d8", // Light text
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
}
