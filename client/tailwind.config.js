export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#FFF8F4',
          100: '#FFF1EB',
          200: '#FCD9C4',
          300: '#F5B99A',
          400: '#F08560',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407',
        }
      }
    },
  },
  plugins: [],
}