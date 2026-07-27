/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          bg: "#0a0e17",
          table: "#1a4a3a",
          tableBorder: "#2d7a60",
          accent: "#d4a853",
          accentHover: "#b88e3d",
          cardBg: "#f8f6f0",
          cardBorder: "#d1ccc0",
          danger: "#e74c3c",
          success: "#27ae60",
          neonGold: "#ffd700",
          neonBlue: "#00f0ff",
        },
      },
      boxShadow: {
        'glow-gold': '0 0 15px rgba(212, 168, 83, 0.5)',
        'glow-blue': '0 0 15px rgba(0, 240, 255, 0.5)',
        'table': 'inset 0 0 50px rgba(0,0,0,0.6)',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(212, 168, 83, 0.8))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(212, 168, 83, 0.3))' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        }
      },
      animation: {
        'card-flip': 'flip 0.6s ease-in-out forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shake': 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
