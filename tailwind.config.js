import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // RAYDAI Brand Colors
        raydai: {
          purple: '#8B5CF6',
          violet: '#7C3AED',
          indigo: '#6D28D9',
          dark: '#0f172a',
          'dark-light': '#1e293b',
        },
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // RAYDAI Animations
        "raydai-shimmer": {
          "0%": { transform: "translateX(-100%) rotate(45deg)" },
          "100%": { transform: "translateX(200%) rotate(45deg)" },
        },
        "raydai-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "raydai-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "raydai-gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        // RAYDAI Animation Classes
        "raydai-shimmer": "raydai-shimmer 3s infinite",
        "raydai-pulse": "raydai-pulse 2s ease-in-out infinite",
        "raydai-float": "raydai-float 3s ease-in-out infinite",
        "raydai-gradient": "raydai-gradient 4s ease infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        // RAYDAI Gradients
        'raydai-primary': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
        'raydai-secondary': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'raydai-gold': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
        'raydai-modal': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'raydai': '0 10px 40px rgba(139, 92, 246, 0.2)',
        'raydai-lg': '0 20px 60px rgba(139, 92, 246, 0.3)',
        'raydai-xl': '0 25px 80px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
