/**
 * 動物園成員資料層。
 *
 * `img` 是去背 PNG（放 public/characters/，出自創作者的「全切防水貼紙」系列
 * 素體造型，白色貼紙框已用 flood fill 去掉；同系列還有芭樂頭套、披風、
 * 花朵座三種造型可替換）。`aspect` 要跟檔案的實際長寬一致，改圖要一起改。
 * 路徑一律經過 asset()，部署在 GitHub Pages 的子路徑下才找得到圖。
 * 沒有 `img` 的角色會 fallback 到 emoji 佔位。
 *
 * ⚠️ 示意資料：角色名稱與介紹文案為暫定示意內容，待創作者提供真實角色設定後替換。
 *    （圖是真的，名字跟個性是編的。）
 */

/** public/ 底下的資源路徑；本機是 /，GitHub Pages 是 /mayco-website/ */
export const asset = (path: string) => import.meta.env.BASE_URL + path;

export interface Character {
  id: string;
  /** emoji 佔位圖 */
  emoji: string;
  /** 去背 PNG 路徑；填了就優先顯示 */
  img?: string;
  /** 寬 / 高 比例 */
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
    img: asset("characters/dog.png"),
    aspect: 527 / 663,
    scale: 1.0,
    name: { zh: "Butter" },
    desc: {
      zh: "白色捲毛的第一隻住戶。毛蓬得像剛烤好的麵包，會在美可畫到很晚的時候趴在腳邊打呼。",
    },
    foundAt: { zh: "撿到地點：家門口的巷子" },
  },
  {
    id: "cat",
    emoji: "🐱",
    img: asset("characters/calico.png"),
    aspect: 406 / 805,
    scale: 1.0,
    name: { zh: "TaiTai" },
    desc: {
      zh: "抱著手臂站著的三花貓。自己走進工作室、自己決定要住下來，負責審核每一張草稿，不喜歡的就用屁股蓋掉。",
    },
    foundAt: { zh: "撿到地點：工作室的窗台" },
  },
  {
    id: "tabby",
    emoji: "🐈",
    img: asset("characters/tabby.png"),
    aspect: 447 / 747,
    scale: 1.0,
    name: { zh: "Lala" },
    desc: {
      zh: "整天在外面撿東西回來的橘貓，最常撿的是路邊的小花。手上那朵是今天的收穫，說要送給下一個敲門的人。",
    },
    foundAt: { zh: "撿到地點：市場的紙箱堆" },
  },
  {
    id: "bear",
    emoji: "🐻",
    img: asset("characters/bear.png"),
    aspect: 619 / 821,
    scale: 1.0,
    name: { zh: "Lulu" },
    desc: {
      zh: "全身黑黑的一團，動作最慢的一位。擅長把所有人團團圍住抱在一起，是「願你被美好團團包圍」的實體版本。",
    },
    foundAt: { zh: "撿到地點：夢裡的森林" },
  },
  {
    id: "bluecat",
    emoji: "🐾",
    img: asset("characters/bluecat.png"),
    aspect: 549 / 817,
    scale: 1.0,
    name: { zh: "Hua" },
    desc: {
      zh: "灰藍色的高個子，遠遠看到人就開始用力揮手，等走近了又突然害羞。其實記得每個訪客上次來是什麼時候。",
    },
    foundAt: { zh: "撿到地點：河堤散步的路上" },
  },
  {
    id: "chick",
    emoji: "🐥",
    aspect: 1,
    scale: 0.92,
    name: { zh: "啾啾" },
    desc: {
      zh: "永遠跟在隊伍最後面的小雞。走三步會跌倒一次，但每次都會自己站起來繼續跟上。（素材還沒到，先用 emoji 代班）",
    },
    foundAt: { zh: "撿到地點：陽台的花盆旁" },
  },
];
