/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ajusta para todos os arquivos React
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
