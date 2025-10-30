/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY COLORS - Northern Sky Palette
        midnight: {
          navy: '#0B1A2B',      // Primary dark - night sky, deep waters
          blue: '#0f1c2e',       // Legacy support
          dark: '#0a1219',       // Legacy support
        },
        aurora: {
          teal: '#2E8B8B',       // Primary brand color - northern lights, ice
          green: '#4CAF6D',      // Aurora green spectrum - central NWT
          purple: '#8B5A9F',     // Aurora purple spectrum - western NWT
          pink: '#E67A9E',       // Aurora pink spectrum - eastern NWT
          blue: '#5B9BD5',       // Aurora blue spectrum - Arctic waters
        },
        arctic: {
          ice: '#E8F4F4',        // Primary light - ice, snow, clarity
        },

        // SECONDARY COLORS - Land & Seasons Palette
        tundra: {
          gold: '#D4A574',       // Autumn tundra, midnight sun, highlights
          brown: '#8b6f47',      // Legacy support
        },
        boreal: {
          green: '#2D5016',      // Northern forests, summer growth, safe zones
        },
        stone: {
          grey: '#6B7280',       // Canadian Shield, secondary text, borders
        },
        frost: {
          white: '#FAFBFC',      // Fresh snow, clarity, primary text on dark
        },

        // LEGACY SUPPORT (mapped to new palette)
        ice: {
          blue: '#E8F4F4',       // Maps to arctic.ice
          white: '#FAFBFC',      // Maps to frost.white
        },
        forest: {
          green: '#2D5016',      // Maps to boreal.green
          dark: '#1a2e0a',       // Darker variant
        },

        // SAFETY & ALERT COLORS
        safety: {
          critical: '#DC2626',   // Danger, hazards, critical alerts
          warning: '#F59E0B',    // Caution, weather warnings
          caution: '#FCD34D',    // Advisory, shallow water
          success: '#10B981',    // Confirmed safe, completed, verified
          // Legacy support
          red: '#DC2626',
          orange: '#F59E0B',
          yellow: '#FCD34D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Type scale from brand guidelines
        'hero': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'h5': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'tiny': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0' }],
      },
      backgroundImage: {
        // Updated gradients with new palette
        'aurora-gradient': 'linear-gradient(135deg, #2E8B8B 0%, #8B5A9F 50%, #5B9BD5 100%)',
        'northern-sky': 'linear-gradient(180deg, #0B1A2B 0%, #0f1c2e 50%, #0a1219 100%)',
        'ice-gradient': 'linear-gradient(180deg, #E8F4F4 0%, #FAFBFC 100%)',
        'midnight-gradient': 'linear-gradient(180deg, #0f1c2e 0%, #0B1A2B 100%)',
        'tundra-gradient': 'linear-gradient(135deg, #D4A574 0%, #8b6f47 100%)',
      },
      boxShadow: {
        'aurora': '0 4px 20px rgba(46, 139, 139, 0.3)',
        'ice': '0 4px 15px rgba(232, 244, 244, 0.4)',
        'glow-teal': '0 0 20px rgba(46, 139, 139, 0.5)',
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'elevation-2': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'elevation-3': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
        'modal': '16px',
      },
      spacing: {
        'touch-target': '44px',  // Minimum touch target size
      },
      animation: {
        'aurora-wave': 'aurora 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-alert': 'pulseAlert 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        aurora: {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'translateY(-10px) translateX(10px)',
            opacity: '1',
          },
        },
        pulseAlert: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
        slideInRight: {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideDown: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        bounceGentle: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0.0, 0.6, 1)',
        'bounce-custom': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        'micro': '150ms',
        'component': '250ms',
        'page': '300ms',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
