# 心天秤 ─ Mind Sync 🎴

> **不言而喻的默契，落牌印證的心。**
>
> 心天秤（Kokoro Tenbin）是一款即時多人線上合作卡牌遊戲，靈感源自桌遊《The Mind》。玩家們在不能交流的前提下，憑藉直覺與默契，將手中的數字牌由小到大依序暗出至公共盤面。

🌐 **線上試玩**：[https://louis-369.github.io/mind-sync/](https://louis-369.github.io/mind-sync/)

---

## ✨ 特色亮點

| 特色 | 說明 |
|---|---|
| 🎨 **浮世繪和風美學** | 深海夜空色調、金箔燙印質感、和紙卡牌翻轉、朱紅印章「確」|
| 🔗 **即時多人連線** | 基於 Liveblocks 即時同步引擎，毫秒級狀態同步 |
| 📱 **完美響應式** | 手機、平板、桌機三端自適應，單行嚴格上限 4 個席位 |
| 🎯 **直覺操作** | 點擊選位 → 點擊手牌落牌 → 確認鎖定 → 翻牌結算 |
| ⚡ **碰撞檢測** | 多人同時落至同一席位自動標記撞牌，支援收回調頻 |
| 🏆 **勝負結算** | 全場翻牌後即時比對排序正確性，紅綠微光視覺回饋 |
| 🎉 **彩帶慶祝** | 勝利時觸發金箔色系 Confetti 粒子慶祝動畫 |
| 🔒 **Emoji 暗號房** | 三組 Emoji 組合作為房間 ID，私密又趣味 |

---

## 🎮 遊戲規則

### 📖 核心玩法
1. **入座**：所有玩家輸入相同的 Emoji 暗號（如 🐶-🚀-🍎）進入同一房間
2. **發牌**：房主點擊「發牌開局」，系統從 1~100 隨機發牌給每位玩家
3. **暗出**：玩家在**不能交流**的前提下，選擇盤面席位並放置手牌
4. **目標**：讓所有人的牌在盤面上呈現**由小到大**的正確排序
5. **鎖定**：手牌出完後點擊「確認落牌」鎖定，等待全員鎖定
6. **揭示**：全員鎖定後逐一翻牌，揭曉排列是否正確
7. **勝敗**：所有牌完美排序 = ✅ 勝利；任一位置錯誤 = ❌ 失敗

### 🔧 進階設定（房主可調整）
- **人數上限**：2～4 人
- **每人發牌數**：1～10 張
- **生命值系統**：（規劃中）
- **手裏劍功能**：（規劃中）
- **關卡晉級模式**：（規劃中）

---

## 🏗️ 技術架構

### 技術棧

| 層級 | 技術 | 版本 |
|---|---|---|
| **框架** | Next.js (App Router, Static Export) | 15.x |
| **語言** | TypeScript | 5.x |
| **UI 框架** | React | 19.x |
| **即時同步** | Liveblocks (Storage + Presence) | 2.x |
| **樣式** | Tailwind CSS + 自定義浮世繪主題 | 3.x |
| **圖示** | Lucide React | 0.475+ |
| **動畫** | canvas-confetti（勝利慶祝） | 1.9+ |
| **部署** | GitHub Pages (GitHub Actions CI/CD) | — |

### 專案結構

```
mind-sync/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions 自動部署
├── src/
│   ├── app/
│   │   ├── globals.css         # 全域樣式與浮世繪主題
│   │   ├── layout.tsx          # 根佈局（字型、Metadata）
│   │   ├── page.tsx            # 大廳頁面（暱稱輸入 + Emoji 選房）
│   │   └── room/
│   │       └── page.tsx        # 遊戲房間頁面（核心遊戲介面）
│   ├── components/
│   │   ├── game/
│   │   │   ├── BoardSlot.tsx   # 盤面單一席位（空位/落牌/碰撞/翻牌）
│   │   │   ├── GameBoard.tsx   # 盤面容器（4個一行分組演算法）
│   │   │   ├── GameStatus.tsx  # 頂部狀態列（房間 ID/生命/手裏劍）
│   │   │   ├── HostPanel.tsx   # 房主設定彈窗
│   │   │   ├── PlayerHand.tsx  # 底部手牌區（出牌/鎖定）
│   │   │   ├── PlayerList.tsx  # 同伴列表（打勾/等待動畫）
│   │   │   └── ResultOverlay.tsx # 勝負結果彈窗（彩帶/重新開局）
│   │   ├── lobby/
│   │   │   ├── EmojiPicker.tsx # Emoji 三欄房間暗號選擇器
│   │   │   └── NameInput.tsx   # 暱稱輸入元件
│   │   ├── providers/
│   │   │   └── LiveblocksWrapper.tsx # Liveblocks Provider 封裝
│   │   └── ui/
│   │       ├── Button.tsx      # 通用按鈕（ghost/primary/多尺寸）
│   │       ├── Card.tsx        # 卡牌元件（正面/背面/翻轉動畫）
│   │       └── Modal.tsx       # 通用模態框
│   ├── hooks/
│   │   ├── useGameState.ts     # 核心遊戲狀態管理 Hook（Liveblocks Mutations）
│   │   ├── usePlayerId.ts      # 玩家身分管理 Hook
│   │   └── useRoomId.ts        # 房間 ID 解析 Hook
│   ├── lib/
│   │   ├── constants.ts        # 遊戲常數（Emoji、預設設定、稱號）
│   │   └── gameLogic.ts        # 遊戲邏輯（Fisher-Yates 洗牌）
│   └── types/
│       ├── game.ts             # 遊戲型別定義
│       └── liveblocks.d.ts     # Liveblocks 型別宣告
├── tailwind.config.js          # Tailwind 浮世繪主題擴展
├── next.config.mjs             # Next.js 靜態匯出設定
└── package.json
```

### 設計系統 — 浮世繪色彩盤

| 色票名稱 | 色碼 | 用途 |
|---|---|---|
| `ukiyo-bg` | `#0d1b2a` | 深海夜空背景 |
| `ukiyo-surface` | `#1b2838` | 面板/卡片背景 |
| `ukiyo-wave` | `#2d5a7b` | 波浪中段藍 |
| `ukiyo-foam` | `#e8dcc8` | 和紙金米色（卡牌正面） |
| `ukiyo-cream` | `#f5f0e3` | 古紙底色 |
| `ukiyo-vermillion` | `#c73e1d` | 朱紅（警告/碰撞/印章） |
| `ukiyo-gold` | `#c9a96e` | 金箔色（高亮/標籤） |
| `ukiyo-mist` | `#8a9bb0` | 山嵐霧（次要文字） |
| `ukiyo-ink` | `#2a2a2a` | 墨黑（正面數字） |

---

## 🚀 快速開始

### 前置需求
- Node.js ≥ 20
- npm ≥ 9
- 一組 [Liveblocks](https://liveblocks.io/) Public API Key

### 安裝與啟動

```bash
# 1. 複製專案
git clone https://github.com/Louis-369/mind-sync.git
cd mind-sync

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.local.example .env.local
# 編輯 .env.local，填入你的 Liveblocks Public Key：
# NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_live_xxxxx

# 4. 啟動開發伺服器
npm run dev
```

開啟瀏覽器前往 `http://localhost:3000` 即可開始遊玩。

### 部署至 GitHub Pages

本專案已設定 GitHub Actions 自動部署。只需：

1. 在 GitHub Repo → Settings → Secrets 新增 `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`
2. 推送至 `main` 分支即自動觸發建置與部署

---

## 📐 核心資料流

```
┌─────────────┐     Liveblocks      ┌─────────────┐
│   Player A  │ ◄──── Storage ────► │   Player B  │
│             │ ◄──── Presence ───► │             │
└──────┬──────┘    (即時雙向同步)     └──────┬──────┘
       │                                     │
       ▼                                     ▼
  useGameState()                        useGameState()
       │                                     │
       ▼                                     ▼
  ┌─────────┐                          ┌─────────┐
  │ Storage │  board (盤面卡牌 Map)    │ Storage │
  │         │  hands (各玩家手牌)      │         │
  │         │  lockedPlayers (鎖定)    │         │
  │         │  status (遊戲狀態)       │         │
  │         │  settings (房間設定)     │         │
  └─────────┘                          └─────────┘
```

### 遊戲狀態機

```
waiting ──(房主發牌)──► playing ──(全員鎖定)──► locked ──(全翻完)──► finished
   ▲                                                                    │
   └────────────────────(房主重新開局)──────────────────────────────────┘
```

---

## 📄 授權

本專案為個人作品，僅供學習與參考。

---

<p align="center">
  <sub>以心入座 ・ 以默契落牌 ・ <b>心天秤</b></sub>
</p>
