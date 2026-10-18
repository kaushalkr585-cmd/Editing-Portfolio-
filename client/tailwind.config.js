/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0C0C0C',
          secondary: '#141414',
          surface: '#1A1A1A',
          elevated: '#222222',
        },
        foreground: {
          DEFAULT: '#F5F5F5',
          muted: '#A6A6A6',
          subtle: '#6E6E6E',
        },
        brand: {
          violet: '#7621B0',
          magenta: '#B600A8',
          orange: '#BE4C00',
          darkViolet: '#18011F',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(182, 0, 168, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
      },
      backgroundImage: {
        'button-gradient': 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        'heading-gradient': 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(118, 33, 176, 0.4)',
        'glow-magenta': '0 0 30px -5px rgba(182, 0, 168, 0.4)',
        'button-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
