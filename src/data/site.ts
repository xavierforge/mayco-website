/**
 * 站台層級的共用資料：品牌識別、導覽、真實聯絡資訊。
 */

export const brand = {
  name: { zh: "美可女子", en: "Mayco" },
  tagline: { zh: "願你被美好團團包圍" },
  slogan: { en: "Welcome to my zoo." },
  intro: { zh: "一個到處撿到動物的女畫仔" },
  kaomoji: "(´,,•ω•,,)♡",
  sun: "☀",
};

/**
 * 首頁角落的搖搖裝飾。位置刻意壓在四個角落，不擋標題也不擋動物。
 * `delay` 讓每個符號的逐格搖擺錯開，看起來才不像整齊劃一的機器動作。
 */
export interface HeroDecoration {
  emoji: string;
  /** 用 CSS 定位值，四角各挑兩邊 */
  position: { top?: string; bottom?: string; left?: string; right?: string };
  /** 動畫延遲（秒） */
  delay: number;
  /** 桌機字級（px），手機會自動縮小 */
  size: number;
}

export const heroDecorations: HeroDecoration[] = [
  { emoji: "☀", position: { top: "12%", left: "6%" }, delay: 0, size: 44 },
  { emoji: "🌈", position: { top: "16%", right: "7%" }, delay: 0.4, size: 38 },
  { emoji: "🌼", position: { bottom: "20%", left: "9%" }, delay: 0.8, size: 32 },
  { emoji: "✨", position: { bottom: "16%", right: "8%" }, delay: 1.2, size: 30 },
];

export interface NavItem {
  to: string;
  label: string;
}

export const navItems: NavItem[] = [
  { to: "/", label: "首頁" },
  { to: "/story", label: "美可的故事" },
  { to: "/history", label: "品牌履歷" },
  { to: "/shop", label: "經典商品" },
  { to: "/pixel", label: "像素小鎮" },
];

/** 真實聯絡資訊（已確認，可直接使用） */
export const contact = {
  email: "mayco.2021.tw@gmail.com",
  instagram: { handle: "@mayco.tw", url: "https://instagram.com/mayco.tw" },
  line: { id: "@964rbotl", url: "https://line.me/R/ti/p/@964rbotl" },
  portaly: { label: "portaly.cc/mayco", url: "https://portaly.cc/mayco" },
};

export const socialLinks = [
  { label: "Instagram", value: contact.instagram.handle, url: contact.instagram.url, emoji: "📷" },
  { label: "Email", value: contact.email, url: `mailto:${contact.email}`, emoji: "✉️" },
  { label: "LINE", value: contact.line.id, url: contact.line.url, emoji: "💬" },
  { label: "Portaly", value: contact.portaly.label, url: contact.portaly.url, emoji: "🔗" },
];
