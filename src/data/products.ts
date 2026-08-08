/**
 * 「經典商品 / 美可雜貨店」頁面內容。
 *
 * ⚠️ 示意資料：品名、價格、庫存狀態皆為示意，待創作者提供真實商品資料後替換。
 * 商品圖同樣先用 emoji 佔位，之後填 `img`（例如 '/products/sticker-pack.png'）即可。
 */
export interface Product {
  id: string;
  name: string;
  /** 商品副標，一句話講清楚是什麼 */
  desc: string;
  /** 新台幣定價 */
  price: number;
  emoji: string;
  img?: string;
  status: "in-stock" | "sold-out";
  /** 分類標籤 */
  category: string;
}

export const shopIntro = {
  title: "美可雜貨店",
  lead: "每天用得到的小東西，帶一點歪歪的、手作的溫度 ☀",
};

/** 購買說明（7-11 賣貨便） */
export const shipping = {
  title: "怎麼買？",
  points: [
    "全店走 7-11 賣貨便，運費 35 元，取貨付款。",
    "不用註冊會員，選好商品填資料就完成，超商取貨最方便。",
    "出貨前都會親手檢查一次，包材是雜貨店風格的牛皮紙袋。",
  ],
  ctaLabel: "前往賣貨便下單",
  // TODO: 換成實際的 7-11 賣貨便賣場連結，目前先指向 portaly 總入口
  ctaUrl: "https://portaly.cc/mayco",
  ctaNote: "（實際賣貨便連結待補，目前先連到 Mayco 的 portaly 總入口）",
};

export const products: Product[] = [
  {
    id: "sticker-pack",
    name: "動物園貼紙包",
    desc: "一次收藏全員的防水貼紙，共 12 張，貼水壺筆電都不怕。",
    price: 120,
    emoji: "🏷️",
    status: "in-stock",
    category: "貼紙",
  },
  {
    id: "acrylic-stand",
    name: "壓克力立牌 · 阿旺",
    desc: "厚 3mm、附底座，放桌上有人陪你上班的那種安心感。",
    price: 320,
    emoji: "🪧",
    status: "in-stock",
    category: "立牌",
  },
  {
    id: "laundry-bag",
    name: "動物洗衣袋（大）",
    desc: "細網布加拉鍊收納釦，洗衣服的時候也要被美好團團包圍。",
    price: 180,
    emoji: "🧺",
    status: "in-stock",
    category: "生活雜貨",
  },
  {
    id: "card-holder",
    name: "證件套 · 太陽款",
    desc: "軟質防刮，附可拆掛繩，通勤的時候每天見一次太陽 ☀",
    price: 220,
    emoji: "🪪",
    status: "in-stock",
    category: "生活雜貨",
  },
  {
    id: "washi-tape",
    name: "紙膠帶 · 撿到動物的一天",
    desc: "15mm 寬，一整條都是散步時遇到的動物們。",
    price: 150,
    emoji: "🎗️",
    status: "sold-out",
    category: "文具",
  },
  {
    id: "postcard-set",
    name: "明信片組（6 入）",
    desc: "六個場景、六句想跟你說的話，可以寄出去也可以自己留著。",
    price: 200,
    emoji: "✉️",
    status: "in-stock",
    category: "文具",
  },
  {
    id: "tote-bag",
    name: "帆布袋 · Welcome to my zoo.",
    desc: "12 盎司厚磅，裝一本書一個便當剛剛好。",
    price: 480,
    emoji: "👜",
    status: "in-stock",
    category: "生活雜貨",
  },
  {
    id: "keyring",
    name: "軟膠鑰匙圈 · 小咪",
    desc: "捏起來會回彈的軟軟手感，掛包包最顯眼。",
    price: 260,
    emoji: "🔑",
    status: "sold-out",
    category: "吊飾",
  },
];
