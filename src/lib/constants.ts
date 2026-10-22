import { GameSettings, TopicItem } from "../types/game";

// 預設 Liveblocks Public Key (未設定環境變數時備用)
export const DEFAULT_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_placeholder_key_mind_sync";

// 房間名稱 Emoji 選項清單 (分三組供玩家搭配選擇)
export const EMOJI_GROUPS = {
  animals: ["🐶", "🐱", "🦊", "🦁", "🐸", "🐵", "🦄", "🦉"],
  items: ["🚗", "🚀", "🎮", "🎸", "💎", "👑", "🔮", "⚡"],
  foods: ["🍎", "🍕", "🍔", "🍣", "🍩", "🍦", "🥑", "🍟"],
};

// 預設遊戲設定
export const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 4,
  cardsPerPlayer: 2,
  showCollisionName: true,
  showTopic: true,
};

// 預設純數字主題
export const DEFAULT_TOPIC: TopicItem = {
  id: "classic-numbers",
  title: "純數字心流默契",
  minLabel: "極小 1",
  maxLabel: "極大 100",
  category: "經典",
};

// 精選價值觀主題卡庫 (ITO / 派對爆笑主題)
export const TOPIC_DECK: TopicItem[] = [
  DEFAULT_TOPIC,
  {
    id: "annoying-gift",
    title: "收到最想翻白眼的交換禮物",
    minLabel: "勉強能用",
    maxLabel: "當場絕交送警局",
    category: "派對",
  },
  {
    id: "social-death",
    title: "人生最社死的瞬間",
    minLabel: "尷尬微笑",
    maxLabel: "連夜搭火箭移民火星",
    category: "生活",
  },
  {
    id: "useless-superpower",
    title: "最廢但意外想要的超能力",
    minLabel: "毫無存在感",
    maxLabel: "廢到笑但天天用",
    category: "幻想",
  },
  {
    id: "horror-movie-death",
    title: "恐怖片裡最快領便當的行為",
    minLabel: "稍微落單",
    maxLabel: "大喊「我去地下室看看」",
    category: "電影",
  },
  {
    id: "unbearable-person",
    title: "最讓人理智瞬間斷線的行為",
    minLabel: "暗自白眼",
    maxLabel: "當場化身超級賽亞人",
    category: "生活",
  },
  {
    id: "island-survival",
    title: "流落無人島最想隨身攜帶的物品",
    minLabel: "廢紙一張",
    maxLabel: "多功能生存神物",
    category: "冒險",
  },
  {
    id: "awkward-encounter",
    title: "走在路上最不想巧遇的人",
    minLabel: "點頭帶過",
    maxLabel: "拔腿跳進水溝躲起來",
    category: "生活",
  },
  {
    id: "midnight-cravings",
    title: "罪惡感突破天際的深夜宵夜",
    minLabel: "清淡小點",
    maxLabel: "熱量核彈體重暴增",
    category: "美食",
  },
  {
    id: "first-date-disaster",
    title: "初次約會最扣分的雷點",
    minLabel: "小瑕疵",
    maxLabel: "原地逃跑直接封鎖",
    category: "感情",
  },
  {
    id: "dream-job-perk",
    title: "夢幻公司最讓人心動的福利",
    minLabel: "可有可無",
    maxLabel: "這輩子為公司做牛做馬",
    category: "職場",
  },
  {
    id: "zombie-weapon",
    title: "喪屍爆發時手邊最想抄起的武器",
    minLabel: "塑膠湯匙",
    maxLabel: "末日戰神屠龍寶刀",
    category: "幻想",
  },
  {
    id: "travel-companion",
    title: "出國自由行最雷的旅伴特徵",
    minLabel: "偶爾迷路",
    maxLabel: "從第一天吵到航站解散",
    category: "旅遊",
  },
  {
    id: "bad-habit",
    title: "最想戒掉但天天破戒的壞習慣",
    minLabel: "無傷大雅",
    maxLabel: "毀滅性墮落",
    category: "生活",
  },
  {
    id: "guilty-pleasure",
    title: "難以啟齒但爽度破表的冷門嗜好",
    minLabel: "微不足道",
    maxLabel: "靈魂升天極樂享受",
    category: "生活",
  },
  {
    id: "borrow-money-excuse",
    title: "朋友借錢時最瞎的理由",
    minLabel: "忘記帶錢包",
    maxLabel: "投資外星人保證賺十倍",
    category: "生活",
  },
  {
    id: "hotpot-disaster",
    title: "最無法忍受的邪教火鍋料",
    minLabel: "平淡無奇",
    maxLabel: "爛泥芋頭毀滅整鍋湯",
    category: "美食",
  },
  {
    id: "alarm-refusal",
    title: "早晨鬧鐘響起時最不想起床的心情",
    minLabel: "伸個懶腰",
    maxLabel: "世界毀滅吧今天不上班",
    category: "生活",
  },
  {
    id: "nightmare-neighbor",
    title: "租屋最讓人理智斷線的鄰居行為",
    minLabel: "拖鞋聲稍大",
    maxLabel: "半夜兩點打泰拳開電音趴",
    category: "生活",
  },
  {
    id: "anime-villain-strength",
    title: "動漫角色讓人絕望的壓迫感",
    minLabel: "路邊雜魚小兵",
    maxLabel: "一指彈爆全宇宙",
    category: "幻想",
  },
  {
    id: "gym-nuisance",
    title: "健身房最想叫保安請離的行為",
    minLabel: "偶爾霸佔器材",
    maxLabel: "坐著滑手機兩小時噴香水",
    category: "生活",
  },
  {
    id: "wrong-chat-message",
    title: "最想當場投胎的傳錯訊息事件",
    minLabel: "發錯表情包",
    maxLabel: "吐槽老闆傳進全公司大群",
    category: "職場",
  },
  {
    id: "clickbait-video",
    title: "看了最想退訂的詐欺影片類型",
    minLabel: "標題稍誇張",
    maxLabel: "全片無重點封面純詐欺",
    category: "娛樂",
  },
  {
    id: "greatest-invention",
    title: "人類史上最偉大的救命發明",
    minLabel: "便利貼",
    maxLabel: "冷氣與光纖網路",
    category: "生活",
  },
  {
    id: "toxic-teammate",
    title: "線上遊戲最讓人血壓狂飆的隊友",
    minLabel: "走位失誤",
    maxLabel: "狂送頭開麥怒噴掛機",
    category: "遊戲",
  },
  {
    id: "lottery-first-thing",
    title: "突然獨得十億樂透第一件想做的事",
    minLabel: "買杯大熱拿加糖",
    maxLabel: "包下直升機回公司辭職",
    category: "幻想",
  },
  {
    id: "cinema-pest",
    title: "電影院裡最想當場抓狂的行為",
    minLabel: "爆米花吃太大聲",
    maxLabel: "整場狂踢椅背開閃光燈講電話",
    category: "娛樂",
  },
  {
    id: "dreadful-homework",
    title: "學生時期看到最想撕碎的作業",
    minLabel: "抄寫十遍單字",
    maxLabel: "爆肝通宵算不出一題微積分",
    category: "生活",
  },
  {
    id: "shady-bill-split",
    title: "聚餐結帳最讓人火大的精算怪人",
    minLabel: "少付兩塊銅板",
    maxLabel: "連喝一口水都要除以人頭精算到小數點",
    category: "生活",
  },
  {
    id: "guilty-habit",
    title: "人生做過最心虛但沒人發現的壞事",
    minLabel: "踩過小花圃",
    maxLabel: "偷吃室友最後一塊布丁還嫁禍給貓",
    category: "生活",
  },
];

// 預設玩家隨機稱號 (典雅和風雅號)
export const RANDOM_NAMES = [
  "秤心客", "調頻師", "默契匠", "知音人",
  "觀潮客", "聽風者", "落花師", "探幽人",
  "持衡者", "明鏡客", "同心匠", "渡雲者"
];

// 快速心情氣泡
export const QUICK_REACTIONS = ["🤔", "🔥", "😱", "🙏", "👀", "🎉"];
