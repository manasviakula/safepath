/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        command: {
          950: '#070a12',
          900: '#0b1120',
          850: '#0f172a',
          800: '#15203b',
          750: '#1b2848',
          700: '#223259',
          600: '#334879',
          500: '#4863a0',
          border: '#1e293b',
          borderLight: '#2b3b55'
        },
        emergency: {
          red: '#ef4444',
          'red-glow': 'rgba(239, 68, 68, 0.4)',
          amber: '#f59e0b',
          'amber-glow': 'rgba(245, 158, 11, 0.4)',
          green: '#10b981',
          'green-glow': 'rgba(16, 185, 129, 0.4)',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          route: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dash': 'dash 20s linear infinite',
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-1000'
          }
        }
      }
    },
  },
  plugins: [],
}
