/**
 * 動物園成員資料層。
 *
 * 目前用 emoji 佔位。之後要換成美可女子的真實角色去背 PNG 時，
 * 只需要在這裡把 `img` 填上（例如 '/characters/dog.png'），
 * 並依實際圖片調整 `aspect`（寬/高）與 `scale`（相對基準大小）即可，
 * 其他元件與物理引擎都不用動 —— 有 `img` 就顯示圖片，沒有就 fallback 到 emoji。
 *
 * ⚠️ 示意資料：角色名稱與介紹文案為暫定示意內容，待創作者提供真實角色設定後替換。
 */
export interface Character {
  id: string;
  /** emoji 佔位圖 */
  emoji: string;
  /** 之後的去背 PNG 路徑；填了就優先顯示 */
  img?: string;
  /** 寬 / 高 比例，決定物理剛體的形狀 */
  aspect: number;
  /** 相對基準大小的縮放 */
  scale: number;
  name: { zh: string };
  desc: { zh: string };
  /** 介紹卡上的小標籤（撿到的地點／日子） */
  foundAt?: { zh: string };
}

export const characters: Character[] = [
  {
    id: "dog",
    emoji: "🐶",
    aspect: 1,
    scale: 1.2,
    name: { zh: "阿旺" },
    desc: {
      zh: "在巷口的紙箱旁邊撿到的第一隻動物。尾巴搖起來像節拍器，會在美可畫到很晚的時候趴在腳邊打呼。",
    },
    foundAt: { zh: "撿到地點：家門口的巷子" },
  },
  {
    id: "cat",
    emoji: "🐱",
    aspect: 1,
    scale: 1.0,
    name: { zh: "小咪" },
    desc: {
      zh: "自己走進工作室、自己坐上桌子、自己決定要住下來的貓。負責審核每一張草稿，不喜歡的就用屁股蓋掉。",
    },
    foundAt: { zh: "撿到地點：工作室的窗台" },
  },
  {
    id: "rabbit",
    emoji: "🐰",
    aspect: 1,
    scale: 1.1,
    name: { zh: "布丁" },
    desc: {
      zh: "耳朵長得跟麻糬一樣軟。膽子很小但很愛撒嬌，被抱起來的時候會發出小小的呼嚕聲 (´,,•ω•,,)♡",
    },
    foundAt: { zh: "撿到地點：市集攤位底下" },
  },
  {
    id: "bear",
    emoji: "🐻",
    aspect: 1,
    scale: 1.0,
    name: { zh: "大熊" },
    desc: {
      zh: "動物園裡體型最大、動作最慢的一位。擅長把所有人團團圍住抱在一起，是「願你被美好團團包圍」的實體版本。",
    },
    foundAt: { zh: "撿到地點：夢裡的森林" },
  },
  {
    id: "chick",
    emoji: "🐥",
    aspect: 1,
    scale: 0.92,
    name: { zh: "啾啾" },
    desc: {
      zh: "永遠跟在隊伍最後面的小雞。走三步會跌倒一次，但每次都會自己站起來繼續跟上。",
    },
    foundAt: { zh: "撿到地點：陽台的花盆旁" },
  },
  {
    id: "turtle",
    emoji: "🐢",
    aspect: 1,
    scale: 0.85,
    name: { zh: "慢慢" },
    desc: {
      zh: "動物園的資深住戶。座右銘是「今天沒畫完也沒關係」，最喜歡曬太陽 ☀ 曬到殼熱熱的。",
    },
    foundAt: { zh: "撿到地點：河堤散步的路上" },
  },
];
