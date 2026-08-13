/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-orange': '#ff4900',
        'custom-blue': '#02a0bf',
        "custom-white": "",
        'custom-cream': '#FDFBF7',
        'custom-terracotta': '#C65B47',
        'custom-terracotta-dark': '#A34633',
        'custom-ochre': '#DDA15E',
        'custom-forest': '#283618',
        'custom-forest-light': '#606C38',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
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
