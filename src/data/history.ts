/**
 * 「品牌履歷」時間軸內容。
 *
 * ⚠️ 示意資料：以下里程碑全部是為了呈現版面而寫的示意事件，
 * 年份與內容都不是真實紀錄，待創作者提供真實品牌大事紀後整批替換。
 */
export interface Milestone {
  year: string;
  /** 月份或季度，可省略 */
  when?: string;
  title: string;
  desc: string;
  emoji: string;
  /** 標記為重要里程碑，圓點會放大 */
  highlight?: boolean;
}

export const historyIntro = {
  title: "品牌履歷",
  lead: "從一支鉛筆到一間動物園，慢慢走過來的路 ☀",
  note: "以下為示意內容，實際年份與事件待補。",
};

export const milestones: Milestone[] = [
  {
    year: "2021",
    when: "春",
    title: "開始到處撿到動物",
    desc: "在社群上貼出第一批動物塗鴉，把路邊、夢裡、朋友口中的動物一隻一隻撿進畫本。",
    emoji: "🐶",
    highlight: true,
  },
  {
    year: "2021",
    when: "夏",
    title: "「美可女子」這個名字誕生",
    desc: "決定用一個溫溫的名字當作創作署名，太陽 ☀ 成為固定出現的品牌符號。",
    emoji: "☀",
  },
  {
    year: "2022",
    when: "春",
    title: "第一張貼紙上架",
    desc: "把最常被問到的那隻動物做成貼紙，第一批數量少到自己在家一張一張裝袋。",
    emoji: "🏷️",
    highlight: true,
  },
  {
    year: "2022",
    when: "秋",
    title: "第一次市集擺攤",
    desc: "帶著一箱商品和一張桌巾出門，緊張到手抖，收攤時卻捨不得走。",
    emoji: "🎪",
  },
  {
    year: "2023",
    when: "春",
    title: "美可雜貨店開張",
    desc: "商品線從貼紙延伸到立牌、洗衣袋、證件套，變成一間什麼都有一點的雜貨店。",
    emoji: "🏪",
    highlight: true,
  },
  {
    year: "2023",
    when: "冬",
    title: "第一次品牌聯名",
    desc: "和喜歡的店家一起做了限定商品，第一次看到自己的動物出現在別人的空間裡。",
    emoji: "🤝",
  },
  {
    year: "2024",
    title: "動物園越來越熱鬧",
    desc: "角色成員持續增加，開始有人帶著自己的收藏照片來打招呼。",
    emoji: "🐰",
  },
  {
    year: "至今",
    title: "還在繼續撿",
    desc: "願你被美好團團包圍 —— 這句話還會被畫進更多張圖裡 (´,,•ω•,,)♡",
    emoji: "💛",
    highlight: true,
  },
];

export const collabIntro = {
  title: "合作洽詢",
  lead: "插畫委託、品牌聯名、市集邀約都歡迎來聊聊 ☀",
};
