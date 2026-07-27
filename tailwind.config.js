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
        ukiyo: {
          bg: "#0d1b2a",          // 深海夜空
          surface: "#1b2838",     // 面板/卡片背景
          wave: "#2d5a7b",        // 波浪中段藍
          foam: "#e8dcc8",        // 卡片正面/高亮 (和紙金米色)
          cream: "#f5f0e3",       // 古紙底色
          vermillion: "#c73e1d",  // 朱紅 (警告/印章)
          indigo: "#3d5a80",      // 藍染藍 (按鈕)
          indigoHover: "#2c4260", // 藍染藍懸停
          gold: "#c9a96e",        // 金箔色
          ink: "#2a2a2a",         // 墨黑 (字體)
          mist: "#8a9bb0",        // 山嵐霧 (次要字)
          ash: "#3d5a80",         // 輔助邊框
        },
      },
      fontFamily: {
        serif: ["'Noto Serif JP'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        'ukiyo-soft': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'ukiyo-glow': '0 0 20px rgba(201, 169, 110, 0.3)',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        waveFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        tenbinSway: {
          '0%, 100%': { transform: 'rotate(-32deg) translateY(0px)' },
          '50%': { transform: 'rotate(-18deg) translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'card-flip': 'flip 0.6s ease-in-out forwards',
        'wave-float': 'waveFloat 4s ease-in-out infinite',
        'tenbin-sway': 'tenbinSway 3.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
