# 🎴 心天秤 (Mind Sync) ─ 浮世繪設計系統規範 (Design System)

> **「以心入座 ‧ 以默契落牌 ‧ 和風美學 ‧ 禪意心天秤」**

`DESIGN.md` 為「心天秤 (Mind Sync)」專案的核心設計系統（Design System）規範文件，定義全站視覺風格、色彩 Token、字體排版、元件規範與微動畫互動標準。

---

## 🎨 1. 設計核心理念 (Design Concept)

本專案融合 **江戶浮世繪 (Ukiyo-e) 和風美學** 與 **現代極簡 Glassmorphism (玻璃質感)**：
- **深海與夜空 (Quiet Ocean & Night Sky)**：以沉穩的深藍夜空色階為底，營造安靜、能專注於心靈默契討論的牌席氛圍。
- **和紙與金箔 (Washi Paper & Gold Foil)**：卡牌使用傳統和紙金米色調，搭配金箔質感高亮與標籤，呈現精緻優雅的燙印感。
- **朱紅落款 (Vermillion Seal)**：重要操作、狀態標記與印章採用傳統日式硃砂印章紅，帶來強烈的視覺焦點與質感儀式感。

---

## 🌈 2. 色彩 Token 規範 (Color Palette)

| 色彩 Token | Hex 色碼 | 語意化用途 | Tailwind 類別 |
|---|---|---|---|
| **`ukiyo-bg`** | `#0d1b2a` | 全站主背景 (深海夜空) | `bg-ukiyo-bg` |
| **`ukiyo-surface`** | `#1b2838` | 面板與卡片底色 (波浪中深藍) | `bg-ukiyo-surface` |
| **`ukiyo-wave`** | `#2d5a7b` | 背景光暈與波浪邊框 | `bg-ukiyo-wave` |
| **`ukiyo-foam`** | `#e8dcc8` | 和紙金米色 (主要卡牌正面 / 主文字) | `text-ukiyo-foam` / `bg-ukiyo-foam` |
| **`ukiyo-cream`** | `#f5f0e3` | 古紙色 (背景亮點 / 標題次要色) | `bg-ukiyo-cream` |
| **`ukiyo-gold`** | `#c9a96e` | 金箔高亮色 (重點按鈕 / 稱號 / 勝利標籤) | `text-ukiyo-gold` / `border-ukiyo-gold` |
| **`ukiyo-vermillion`** | `#c73e1d` | 朱紅印章 (硃砂印章 / 警告 / 撞牌警示) | `bg-ukiyo-vermillion` |
| **`ukiyo-mist`** | `#8a9bb0` | 山嵐霧灰 (說明文字 / 次要標籤) | `text-ukiyo-mist` |
| **`ukiyo-ink`** | `#2a2a2a` | 墨黑 (卡牌正面數字與標題文字) | `text-ukiyo-ink` |

---

## ✒️ 3. 排版與字體系統 (Typography)

1. **主標題與和風精神文案 (`font-serif`)**：
   - 採用日式與繁體中文明體/宋體（如 `Noto Serif JP` / `Songti TC` / `Playfair Display`），表現古典禪意。
   - 適用於：專案標頭 `心天秤`、房間暗號、卡牌說明與結算標題。
2. **數據與邊框編號 (`font-mono`)**：
   - 採用等寬字型，用於顯示槽位編號 (`#1`, `#2`)、倒數計時與狀態 LIVE 標籤。
3. **一般 UI 控制項 (`font-sans`)**：
   - 用於選單、暱稱輸入框與按鈕文案，確保手機端閱讀舒適度。

---

## 🧩 4. 核心元件設計規範 (Component Specs)

### 🎴 卡牌元件 (`Card.tsx`)
- **正面 (Flipped)**：和紙背景 (`bg-ukiyo-foam`)，墨黑大字 (`text-ukiyo-ink`)，右上角佐以朱紅落款印章「確」。
- **背面 (Unflipped)**：深海面板 (`bg-ukiyo-surface`)，金箔花紋邊框 (`border-ukiyo-gold/40`)，展現神祕感。
- **碰撞狀態 (Collision)**：發出朱紅呼吸脈衝微光 (`border-ukiyo-vermillion animate-pulse shadow-[0_0_15px_#c73e1d]`)。

### ⛩️ 盤面席位 (`BoardSlot.tsx`)
- 每行上限 strictly 4 個席位 (`grid-cols-4`)，符合手持裝置與桌面寬度。
- 空位顯示金箔虛線邊框 (`border-dashed border-ukiyo-foam/25`) 與編號標籤 (`#1`, `#2`...)。

### 🔘 通用按鈕 (`Button.tsx`)
- **Primary**：金箔底色 + 深藍文字，配有 hover 放大與光影效果。
- **Secondary**：半透明面板 + 金箔邊框 (`border-ukiyo-gold/40`)。
- **Danger**：朱紅印章紅底色 (`bg-ukiyo-vermillion`)。
- **Ghost**：極簡無背景，hover 時呈現輕微和紙光暈。

### 🪟 通用彈窗 (`Modal.tsx` / `ResultOverlay.tsx`)
- 背景採用強烈高斯模糊 (`backdrop-blur-md bg-ukiyo-bg/85`)。
- 主體為玻璃面板 (`glass-panel`)，配有金箔邊框與日式圓形印章。

---

## 🌊 5. 微動畫與動態互動 (Animations)

- **`animate-wave-float`**：大廳標誌如海浪微波般上下浮動。
- **`animate-tenbin-sway`**：標題「心」印章進行左右禪意微擺搖晃。
- **`canvas-confetti`**：勝利時發射金箔 (`#c9a96e`) 與和紙米色 (`#e8dcc8`) 粒子慶祝動畫。

---

## 📝 6. 開發者維護規範 (Developer Guildlines)

1. 所有 UI 改動必須優先使用 `globals.css` 中的語意化 class (`glass-panel`, `ukiyo-seal`) 或 Tailwind 自定義色票。
2. 禁止硬編碼 (Hardcode) 通用色碼（如純白 `#fff` 或純黑 `#000`），需使用 `ukiyo-cream` 或 `ukiyo-ink` 保持風格一致。
3. 元件需確保在手機 (Mobile, <640px) 與桌機 (Desktop) 兩端皆具備良好的觸控與響應式呈現。
