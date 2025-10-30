/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Northern Theme Color Palette
        aurora: {
          green: '#1a4d2e',
          purple: '#7b2d8e',
          blue: '#4a90a4',
        },
        ice: {
          blue: '#c8e6f5',
          white: '#f8f9fa',
        },
        midnight: {
          blue: '#0f1c2e',
          dark: '#0a1219',
        },
        tundra: {
          gold: '#d4a574',
          brown: '#8b6f47',
        },
        forest: {
          green: '#2d5016',
          dark: '#1a2e0a',
        },
        safety: {
          red: '#c83e3e',
          orange: '#e67e22',
          yellow: '#f39c12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #1a4d2e 0%, #7b2d8e 50%, #4a90a4 100%)',
        'ice-gradient': 'linear-gradient(180deg, #c8e6f5 0%, #f8f9fa 100%)',
        'midnight-gradient': 'linear-gradient(180deg, #0f1c2e 0%, #0a1219 100%)',
      },
      boxShadow: {
        'aurora': '0 4px 20px rgba(122, 45, 142, 0.3)',
        'ice': '0 4px 15px rgba(200, 230, 245, 0.4)',
      },
      animation: {
        'aurora-wave': 'aurora 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0.8' },
          '50%': { transform: 'translateY(-10px) translateX(10px)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
