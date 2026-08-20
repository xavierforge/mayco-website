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

export interface NavItem {
  to: string;
  label: string;
}

export const navItems: NavItem[] = [
  { to: "/", label: "首頁" },
  { to: "/story", label: "美可的故事" },
  { to: "/history", label: "品牌履歷" },
  { to: "/shop", label: "經典商品" },
];

/** 真實聯絡資訊（已確認，可直接使用） */
export const contact = {
  email: "mayco.2021.tw@gmail.com",
  instagram: { handle: "@mayco.tw", url: "https://instagram.com/mayco.tw" },
  line: { id: "@964rbotl", url: "https://line.me/R/ti/p/@964rbotl" },
  portaly: { label: "portaly.cc/mayco", url: "https://portaly.cc/mayco" },
};
