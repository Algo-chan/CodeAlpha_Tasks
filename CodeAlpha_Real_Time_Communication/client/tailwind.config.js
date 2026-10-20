/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          "sans-serif"
        ],
      },
      borderRadius: {
        'card': '24px',
        'tile': '20px',
        'input': '14px',
        'pill': '9999px',
      },
      colors: {
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          overlay: 'var(--color-surface-overlay)',
          glass: 'var(--color-surface-glass)',
        },
        label: {
          DEFAULT: 'var(--color-label)',
          secondary: 'var(--color-label-secondary)',
          tertiary: 'var(--color-label-tertiary)',
          quaternary: 'var(--color-label-quaternary)',
        },
        separator: {
          DEFAULT: 'var(--color-separator)',
          opaque: 'var(--color-separator-opaque)',
        },
        system: {
          gray1: 'var(--color-gray-1)',
          gray2: 'var(--color-gray-2)',
          gray3: 'var(--color-gray-3)',
          gray4: 'var(--color-gray-4)',
          gray5: 'var(--color-gray-5)',
          gray6: 'var(--color-gray-6)',
          destructive: 'var(--color-destructive)',
          'destructive-muted': 'var(--color-destructive-muted)',
          success: 'var(--color-success)',
          'success-muted': 'var(--color-success-muted)',
          warning: 'var(--color-warning)',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08), 0 1px 1px 0 rgba(255, 255, 255, 0.2) inset',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 1px 1px 0 rgba(255, 255, 255, 0.1) inset',
        'floating': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'floating-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        'apple': '20px',
        'subtle': '10px',
      }
    },
  },
  plugins: [],
}
