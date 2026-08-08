/**
 * 探頭動物資料層。
 *
 * 兩側偶發探頭的動物，是跟樂園六隻主角色完全不同的另一批「路過探頭的野生朋友」，
 * 呼應「到處撿到動物」的人設。
 * 目前用 emoji 佔位，之後要換成真的去背 PNG 或 GIF 時，只需要在這裡把 `img`
 * 填上，Critters.tsx 就會自動改顯示圖片，其他邏輯都不用動。
 *
 * ⚠️ 示意資料：動物種類為暫定示意內容，待創作者提供真實素材後替換。
 */
export interface CritterAnimal {
  id: string;
  /** emoji 佔位圖 */
  emoji: string;
  /** 之後的探頭 GIF／去背 PNG 路徑；填了就優先顯示 */
  img?: string;
}

export const critters: CritterAnimal[] = [
  { id: "fox", emoji: "🦊" },
  { id: "frog", emoji: "🐸" },
  { id: "hamster", emoji: "🐹" },
  { id: "koala", emoji: "🐨" },
  { id: "penguin", emoji: "🐧" },
  { id: "owl", emoji: "🦉" },
];
