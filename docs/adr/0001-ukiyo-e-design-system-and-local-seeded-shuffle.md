# 1. 浮世繪設計系統與本機場牌確定性洗牌決策

- **狀態**：已通過 (Accepted)
- **日期**：2026-08-04
- **決策者**：團隊全體

---

## 脈絡 (Context)

「心天秤 (Mind Sync)」是一款基於默契與直覺的即時多人合作卡牌遊戲。在遊戲設計過程中，我們面臨兩個核心課題：
1. **視覺風格與識別度**：傳統卡牌遊戲介面容易趨於同質化，需要建立極具辨識度且能引導玩家進入「靜謐默契」狀態的設計系統。
2. **網路資安與免費額度**：在 Liveblocks 免費版 (20 人 CCU) 限制下，直接傳送全場手牌會導致 DevTools 能輕易窺探手牌作弊，且大量 Storage 變更會迅速耗盡免費額度。

---

## 決策 (Decision)

1. **全面採用「浮世繪 (Ukiyo-e) 和風美學 + 現代 Glassmorphism」設計系統**：
   - 統一使用 `DESIGN.md` 中定義的色彩 Token (`ukiyo-bg` #0d1b2a, `ukiyo-foam` #e8dcc8, `ukiyo-gold` #c9a96e, `ukiyo-vermillion` #c73e1d)。
   - 卡牌使用質感和紙纖維紋理，搭配朱紅硃砂印章落款。
2. **採用「本機確定性種子洗牌 (Seeded Shuffle) + 全域張數同步」架構**：
   - 房主開局僅向 Storage 廣播時間戳記 `dealTimestamp` 與顯式席位映射 `playerSlots`。
   - 每位玩家本機利用 Mulberry32 PRNG 確定性生成手牌，Storage 僅同步手牌剩餘張數 `handCounts`。

---

## 後果 (Consequences)

### 正面影響 (Positive)
- **視覺與體驗高度獨特**：沉穩深海與和紙質感能顯著提高玩家沉浸感與品質認知。
- **絕對防作弊與 0 頻寬浪費**：對手無法透過 DevTools 偷看手牌，且派牌過程為 0 額外 Storage 訊息。

### 負面影響 / 權衡 (Negative / Trade-offs)
- 需要嚴密維護 `playerSlots` 與 `dealTimestamp` 時序，確保斷線重連時本機場牌還原一致。
