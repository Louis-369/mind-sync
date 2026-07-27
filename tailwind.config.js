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
          bg: "#f8f2dc",          // 淺米色 (全網頁主底色)
          surface: "#e9cfae",     // 金米沙色 (面板與容器背景)
          wave: "#16245c",        // 普魯士浪藍
          foam: "#0d1740",        // 濃紺墨藍 (主要高對比字體/標題)
          cream: "#f8f2dc",       // 淺米古紙
          vermillion: "#c73e1d",  // 朱紅 (印章/撞牌警示)
          indigo: "#16245c",      // 普魯士藍 (按鈕)
          indigoHover: "#0d1740", // 濃紺墨藍懸停
          gold: "#16245c",        // 濃紺浪藍高亮
          ink: "#0d1740",         // 濃紺墨藍 (文字/卡牌數字)
          mist: "#5c584e",        // 灰褐色 (次要清晰文字 - 顯眼對比)
          ash: "#a39f93",         // 灰褐色 (輔助邊框)
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
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'card-flip': 'flip 0.6s ease-in-out forwards',
        'wave-float': 'waveFloat 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
