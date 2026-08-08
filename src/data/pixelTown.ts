/**
 * 「像素小鎮」頁面內容。
 *
 * ⚠️ 示意資料：這頁是首頁的實驗版本，居民台詞與場景配置都是示意內容，
 * 待創作者確認角色設定後替換。場景物件同樣先用 emoji，
 * 之後有真的像素素材時，一樣走 characters.ts 的 `img` 慣例。
 */

export const townIntro = {
  title: "像素小鎮",
  lead: "同一批動物居民，換一個 8-bit 的世界住住看 ☀",
  note: "這是首頁的實驗版本：把動物們搬進像素小鎮，原本的物理樂園還在首頁。",
  hint: "點一下居民跟他們說說話",
};

export interface TownProp {
  emoji: string;
  /** 場景寬度百分比 */
  left: number;
  /** 距離地面的高度（px），數字越大站得越後面 */
  bottom: number;
  /** 壓成幾格見方 */
  box: number;
  /** 顯示倍率的加成，讓遠景的東西小一點 */
  sizeFactor: number;
}

/**
 * sizeFactor 會被四捨五入成整數倍（見 PixelTown.tsx），
 * 因為顯示寬度必須是 box 的整數倍，格子才會對齊實體像素。
 * 所以實際只會出現 2 倍 / 3 倍 / 4 倍三種大小 —— 這是像素風本來就有的限制。
 */

/**
 * ⚠️ bottom 就是這個物件的「腳底基準線」，單位是距離地面帶底部的 px。
 * 它同時決定兩件事：畫在哪、以及前後遮擋順序（見 PixelTown 的 painter's algorithm）。
 * 數字越大＝站得越深＝越容易被前面的東西擋住。
 * 居民的腳底線會落在 10（最近）~ 150（最深）之間，所以：
 *   - foreground（12~20）跟最靠前的居民混在一起
 *   - townProps（92~104）居民走到它後面就會被擋住
 *   - backdrop（158~170）永遠在所有居民後面
 */

/** 遠景：地平線附近的樹林與山，永遠在居民後面 */
export const backdropProps: TownProp[] = [
  { emoji: "🌲", left: 6, bottom: 162, box: 24, sizeFactor: 0.5 },
  { emoji: "🏔️", left: 18, bottom: 170, box: 24, sizeFactor: 0.75 },
  { emoji: "🌲", left: 31, bottom: 160, box: 24, sizeFactor: 0.5 },
  { emoji: "⛪", left: 47, bottom: 166, box: 24, sizeFactor: 0.6 },
  { emoji: "🌲", left: 62, bottom: 160, box: 24, sizeFactor: 0.5 },
  { emoji: "🏔️", left: 78, bottom: 170, box: 24, sizeFactor: 0.75 },
  { emoji: "🌲", left: 92, bottom: 162, box: 24, sizeFactor: 0.5 },
];

/** 小鎮本體：居民可以走到它們後面被擋住，這是 2.5D 的關鍵 */
export const townProps: TownProp[] = [
  { emoji: "🏠", left: 10, bottom: 96, box: 24, sizeFactor: 1 },
  { emoji: "🌳", left: 24, bottom: 104, box: 24, sizeFactor: 0.85 },
  { emoji: "🏪", left: 38, bottom: 92, box: 24, sizeFactor: 1 },
  { emoji: "🌳", left: 55, bottom: 100, box: 24, sizeFactor: 0.85 },
  { emoji: "🏡", left: 70, bottom: 96, box: 24, sizeFactor: 1 },
  { emoji: "🌳", left: 86, bottom: 102, box: 24, sizeFactor: 0.85 },
];

/** 路邊的小東西，站在最前面 */
export const foregroundProps: TownProp[] = [
  { emoji: "🌷", left: 4, bottom: 14, box: 24, sizeFactor: 0.5 },
  { emoji: "🌼", left: 30, bottom: 12, box: 24, sizeFactor: 0.5 },
  { emoji: "🪧", left: 48, bottom: 20, box: 24, sizeFactor: 0.6 },
  { emoji: "🌷", left: 66, bottom: 12, box: 24, sizeFactor: 0.5 },
  { emoji: "🌼", left: 94, bottom: 16, box: 24, sizeFactor: 0.5 },
];

/** 天上的雲與太陽，會慢慢逐格飄（見 index.css 的 pixel-cloud） */
export const clouds = [
  { emoji: "☁️", left: 12, top: 14, box: 24, sizeFactor: 0.85, delay: 0 },
  { emoji: "☀", left: 82, top: 10, box: 24, sizeFactor: 1, delay: 1.2 },
  { emoji: "☁️", left: 58, top: 22, box: 24, sizeFactor: 0.6, delay: 2.4 },
];

/** 點居民時他們會說的話（key 對應 characters.ts 的 id） */
export const residentLines: Record<string, string> = {
  dog: "汪！今天也在鎮上巡邏，一切平安 ☀",
  cat: "……你踩到我要曬太陽的位置了。",
  rabbit: "早安！我剛剛在麵包店排到最後一個麵包 (´,,•ω•,,)♡",
  bear: "要不要抱一下？我很會抱喔。",
  chick: "啾！我又跟丟了，大家走好快……",
  turtle: "慢慢走沒關係，這座小鎮又不會跑掉。",
};

export const fallbackLine = "嗨！歡迎來到像素小鎮 ☀";
