/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: true,
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-dark-green': '#1ed760',
        'spotify-black': '#121212',
        'spotify-dark-gray': '#181818',
        'spotify-light-gray': '#282828',
        'spotify-lighter': '#3E3E3E',
        'spotify-light': '#404040',
        'spotify-text-secondary': '#b3b3b3',
      },
      fontFamily: {
        'display': ['Circular Std', 'system-ui', 'sans-serif'],
        'body': ['Circular Std Book', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      height: {
        'screen-minus-player': 'calc(100vh - 90px)', // Assuming player height is 90px
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'spotify-sm': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'spotify-md': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'spotify-lg': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'green': '0 4px 12px rgba(29, 185, 84, 0.3)',
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
      },
      transitionTimingFunction: {
        'spotify': 'cubic-bezier(0.3, 0, 0.4, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        'spotify': '8px',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(180px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(180px, 1fr))',
        'responsive': 'repeat(auto-fit, minmax(200px, 1fr))',
      },
      aspectRatio: {
        'square': '1 / 1',
        'album': '1 / 1',
        'card': '4 / 3',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
} 