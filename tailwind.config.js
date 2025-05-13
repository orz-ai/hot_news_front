/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bbd7fe',
          300: '#8ab6fb',
          400: '#5b91f5',
          500: '#3b76ea',
          600: '#2658d9',
          700: '#2145c4',
          800: '#1e3a9f',
          900: '#1e367e',
          950: '#0f1b43',
        },
        secondary: {
          50: '#f4f6fa',
          100: '#e6eaf3',
          200: '#d1dae8',
          300: '#b3c1d7',
          400: '#8fa1c1',
          500: '#7485ad',
          600: '#616e9e',
          700: '#515a84',
          800: '#454d6d',
          900: '#3c435b',
          950: '#20253a',
        },
        accent: {
          50: '#fef2f3',
          100: '#fde6e7',
          200: '#f9cfd2',
          300: '#f5a9af',
          400: '#ef7983',
          500: '#e64e5c',
          600: '#d42d3d',
          700: '#b32231',
          800: '#942030',
          900: '#7c1e2c',
          950: '#430d14',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          750: '#2a3441',
          800: '#1f2937',
          850: '#18212f',
          900: '#111827',
          950: '#030712',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
            color: 'var(--tw-prose-body)',
            lineHeight: '1.75',
          },
        },
      },
      minHeight: {
        '80': '20rem',
        '100': '25rem',
        '120': '30rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      rotate: {
        '360': '360deg', 
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
      lineClamp: {
        7: '7',
        8: '8',
        9: '9',
        10: '10',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 