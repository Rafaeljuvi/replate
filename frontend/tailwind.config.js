/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D9D78',
          light: '#3DB88C',
          dark: '#257A5E',
        },
        secondary: {
          DEFAULT: '#1F7A5C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(135deg, #2D9D78 0%, #1F7A5C 100%)',
      },
    },
  },
  plugins: [],
}
