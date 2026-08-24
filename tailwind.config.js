/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (preserved for backward compatibility)
        'custom-orange': '#ff4900',
        'custom-blue': '#02a0bf',
        'custom-white': '',
        'custom-cream': '#FDFBF7',
        'custom-terracotta': '#C65B47',
        'custom-terracotta-dark': '#A34633',
        'custom-ochre': '#DDA15E',
        'custom-forest': '#283618',
        'custom-forest-light': '#606C38',
        // Design system tokens
        primary: {
          DEFAULT: '#02A0BF',
          dark: '#0186a0',
          light: '#e0f6fb',
        },
        accent: {
          DEFAULT: '#ff8400',
          light: '#fff4e6',
        },
        navy: {
          DEFAULT: '#002040',
          700: '#003060',
          900: '#001428',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
        },
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      fontWeight: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },
      backgroundImage: {
        'custom-bg': 'url("https://d1ymz67w5raq8g.cloudfront.net/Pictures/1024x536/P/web/e/f/n/classicchemexp_958361.jpg")',
        'texture': 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
      },
    },
  },
  plugins: [],
}
