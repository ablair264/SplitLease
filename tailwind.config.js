/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'background-1': '#f8fafc',
        'background-4': '#f1f5f9',
        'background-5': '#e2e8f0',
        'black-100%': '#000000',
        'black-40%': 'rgba(0, 0, 0, 0.4)',
        'black-4%': 'rgba(0, 0, 0, 0.04)',
        'black-10%': 'rgba(0, 0, 0, 0.1)',
        'Contents-Primary': '#1e293b',
        'Contents-Tertiary': 'rgba(100, 116, 139, 0.6)',
        'Primary-50': '#fef3c7',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mulish': ['Mulish', 'sans-serif'],
        'avenir': ['Avenir', 'sans-serif'],
      }
    },
  },
  plugins: [],
}