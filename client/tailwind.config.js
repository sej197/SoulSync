/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloom-primary': '#8B7FB8',   // lavender purple
        'bloom-secondary': '#E6CFEA', // soft mauve
        'bloom-cream': '#F8F6FA',     // warm off-white
        'bloom-dark': '#2F2F35',      // dark text
        'bloom-muted': '#6B6B76',     // body text
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
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        bloom: {
          "primary": "#8B7FB8",
          "secondary": "#E6CFEA",
          "accent": "#F8F6FA",
          "neutral": "#2F2F35",
          "base-100": "#ffffff",
        },
      },
    ],
  },
}
