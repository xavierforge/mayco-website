/**
 * 美可公寓的資料層。
 *
 * 首頁的主場景。一棟 8-bit 的紅磚公寓：住戶層從 2F 到 4F、每層兩戶住著
 * 六隻動物（住戶文案的唯一來源仍然是 `characters.ts`，這裡只補門牌、
 * 個性標籤與敲門的第一句話），美可自己住最上面的閣樓，她的「門」是
 * mansard 屋頂上那扇老虎窗。1F 是大廳：只有公寓的大門與石階，不住人。
 *
 * `characters.ts` 裡的角色被改名或移除時，對應那一戶會被自動跳過而不是讓首頁爆掉，
 * 所以之後角色名單怎麼調整，這裡最多就是少一扇門。
 *
 * ⚠️ 示意資料：門牌、個性標籤、敲門台詞與工作室介紹都是暫定示意內容，
 *    待創作者提供真實角色設定後替換。住戶的介紹文（`desc`）直接取自 characters.ts。
 */
import { asset, characters } from "./characters";

export interface ApartmentResident {
  id: string;
  name: string;
  /** 門牌上的短名，只有兩三個字，長名字塞不進門牌 */
  short: string;
  /** emoji 佔位圖；有 img 時 img 優先（與全站同一個慣例） */
  emoji: string;
  img?: string;
  /** 個性說明：開門後顯示的主文 */
  desc: string;
  /** 門牌下面那行小字（撿到的地點／職稱） */
  caption?: string;
  /** 個性標籤，做成門牌旁邊的小方塊 */
  tags: string[];
  /** 敲門後開門的第一句話 */
  knockLine: string;
}

export interface ApartmentUnit {
  /** 等於住戶 id，也是門的 key */
  id: string;
  /** 門牌，例如 3F-1 */
  label: string;
  resident: ApartmentResident;
}

export interface ApartmentFloor {
  /** 樓層標示，例如 3F */
  label: string;
  /** 閣樓那層畫成老虎窗，不是磚牆上的門 */
  kind: "attic" | "floor";
  /** 閣樓一戶、一般樓層兩戶 */
  units: ApartmentUnit[];
}

interface UnitSpec {
  label: string;
  /** 對應 characters.ts 的 id；工作室那戶填 null，住戶資料寫在 self */
  characterId: string | null;
  tags: string[];
  knockLine: string;
  /** 沒有對應角色時（美可自己）的住戶資料 */
  self?: Omit<ApartmentResident, "tags" | "knockLine">;
}

/**
 * 由上而下：閣樓在前，畫面上就是從屋頂往下排。
 *
 * 美可住閣樓，六隻動物兩兩一層。要換位子只要改 characterId。
 */
const floorSpecs: { label: string; kind: "attic" | "floor"; units: UnitSpec[] }[] = [
  {
    label: "閣樓",
    kind: "attic",
    units: [
      {
        label: "閣樓",
        characterId: null,
        self: {
          id: "studio",
          name: "美可的工作室",
          short: "美可",
          emoji: "☀",
          img: asset("characters/mayco.png"),
          desc: "屋主本人的房間，也是這棟公寓的起點。斜屋頂下永遠攤著畫到一半的稿子，窗邊那盆植物是唯一活著的室友。撿回來的動物都先在這裡住幾天，熟了才搬進樓下的空房。",
          caption: "閣樓 · 屋主兼管理員",
        },
        tags: ["一直在畫", "咖啡續杯中", "撿動物慣犯"],
        knockLine: "來了來了——小心不要踩到地上的稿子喔 ☀",
      },
    ],
  },
  {
    label: "4F",
    kind: "floor",
    units: [
      {
        label: "4F-1",
        characterId: "bluecat",
        tags: ["揮手狂", "遠熱近羞", "記憶力驚人"],
        knockLine: "（門還沒全開就先伸出手用力揮）嗨——！……啊，你好。",
      },
      {
        label: "4F-2",
        characterId: "tabby",
        tags: ["撿花慣犯", "精力旺盛", "陽台園丁"],
        knockLine: "來了來了！剛好，這朵花送你，今天路邊撿的！",
      },
    ],
  },
  {
    label: "3F",
    kind: "floor",
    units: [
      {
        label: "3F-1",
        characterId: "cat",
        tags: ["草稿審核員", "看心情", "禁止摸肚子"],
        knockLine: "……有事嗎。我正在忙著曬太陽。",
      },
      {
        label: "3F-2",
        characterId: "bear",
        tags: ["體型最大", "動作最慢", "抱抱專家"],
        knockLine: "（門後傳來很慢的腳步聲）……來了……要不要先抱一下？",
      },
    ],
  },
  {
    label: "2F",
    kind: "floor",
    units: [
      {
        label: "2F-1",
        characterId: "dog",
        tags: ["愛巡邏", "超級忠心", "尾巴是節拍器"],
        knockLine: "汪！我馬上來開門——欸，你手上那個是零食嗎？",
      },
      {
        label: "2F-2",
        characterId: null,
        self: {
          id: "closet",
          name: "服裝間",
          short: "服裝間",
          emoji: "🎭",
          desc: "整棟公寓共用的服裝間，掛滿各種頭套跟道具服。敲門的時候會看到剛好有人在裡面試裝——每次開門都不一定是誰、也不一定戴著哪一頂。",
          caption: "2F 公共空間",
        },
        tags: ["共用衣櫃", "頭套收藏", "試裝進行中"],
        knockLine: "（裡面傳來窸窸窣窣的聲音）……進來呀，幫我看看這頂合不合適！",
      },
    ],
  },
];

const byId = new Map(characters.map((character) => [character.id, character]));

/** UnitSpec → 住戶。對應角色不存在時回傳 null，那一戶會被整個跳過 */
function toResident(spec: UnitSpec): ApartmentResident | null {
  if (spec.self) {
    return { ...spec.self, tags: spec.tags, knockLine: spec.knockLine };
  }
  const character = spec.characterId ? byId.get(spec.characterId) : undefined;
  if (!character) return null;
  return {
    id: character.id,
    name: character.name.zh,
    short: character.name.zh,
    emoji: character.emoji,
    img: character.img,
    desc: character.desc.zh,
    caption: character.foundAt?.zh,
    tags: spec.tags,
    knockLine: spec.knockLine,
  };
}

export const apartmentFloors: ApartmentFloor[] = floorSpecs
  .map((floor) => ({
    label: floor.label,
    kind: floor.kind,
    units: floor.units.flatMap((spec) => {
      const resident = toResident(spec);
      return resident ? [{ id: resident.id, label: spec.label, resident }] : [];
    }),
  }))
  .filter((floor) => floor.units.length > 0);

/** 攤平的門名單，給門的狀態機用 */
export const apartmentUnits: ApartmentUnit[] = apartmentFloors.flatMap((floor) => floor.units);

export const apartmentIntro = {
  /** 建築招牌上的字，同時也是首頁的 h1 */
  title: "美可公寓",
  hint: "住戶偶爾會自己開門探頭 · 點門敲一下就會有人來開",
};

export interface ApartmentCloud {
  emoji: string;
  /** 夜晚要換掉的話填這個（太陽 → 月亮）；沒填就日夜共用同一顆 */
  nightEmoji?: string;
  /** 場景寬度百分比 */
  left: number;
  /** 場景高度百分比 */
  top: number;
  box: number;
  sizeFactor: number;
  delay: number;
}

/** 天空。跟像素小鎮的雲同一套逐格飄移，但首頁自己一份，兩邊互不影響 */
export const apartmentClouds: ApartmentCloud[] = [
  { emoji: "☁️", left: 14, top: 12, box: 32, sizeFactor: 0.9, delay: 0 },
  { emoji: "☀", nightEmoji: "🌙", left: 84, top: 10, box: 32, sizeFactor: 1, delay: 1.2 },
  { emoji: "☁️", left: 68, top: 26, box: 32, sizeFactor: 0.6, delay: 2.4 },
];

export interface StreetArt {
  /** public/street/ 底下的去背素材 */
  img: string;
  /** 場景寬度百分比 */
  left: number;
  /** 顯示高度（格），寬度按原圖比例自動走 */
  h: number;
  /** 左右翻面，讓同一張素材看起來不重複 */
  flip?: boolean;
}

/**
 * 公寓門口的街景：小雞與花（去背後放 public/street/）。
 * 建築佔畫面中段，所以位置都排在兩側的空地上；
 * 小雞左右各一群、方向亂一點，才像在路上亂跑。
 */
export const streetArt: StreetArt[] = [
  { img: asset("street/flower.png"), left: 8, h: 15 },
  { img: asset("street/chicken.png"), left: 16, h: 12 },
  { img: asset("street/chicken.png"), left: 23, h: 11, flip: true },
  { img: asset("street/flower.png"), left: 30, h: 14 },
  { img: asset("street/chicken.png"), left: 70, h: 11 },
  { img: asset("street/flower.png"), left: 78, h: 15 },
  { img: asset("street/chicken.png"), left: 86, h: 12, flip: true },
  { img: asset("street/flower.png"), left: 93, h: 14 },
];

/** 屋頂彩蛋：只有半身的青蛙，會隨機從屋頂後面滑出來探一下再縮回去 */
export const frogImage = asset("street/frog.png");

export interface WalkSprite {
  img: string;
  /**
   * 原圖的面向。散步方向跟面向不合時要水平翻面，
   * 不然會倒退走（正面圖兩個方向都行，不翻）。
   */
  facing: "left" | "right" | "front";
}

/**
 * 散步用的走路圖（key 對應住戶 id；美可的 id 是 studio）。
 * 有走路圖的住戶才會被抽去散步；散步中那一戶敲門不會有人應。
 */
export const walkSprites: Record<string, WalkSprite> = {
  studio: { img: asset("characters/walk/mayco.png"), facing: "left" },
  bear: { img: asset("characters/walk/bear.png"), facing: "front" },
  dog: { img: asset("characters/walk/dog.png"), facing: "left" },
  bluecat: { img: asset("characters/walk/bluecat.png"), facing: "left" },
  cat: { img: asset("characters/walk/calico.png"), facing: "front" },
  tabby: { img: asset("characters/walk/tabby.png"), facing: "front" },
};

/** 服裝間的 id：開門時要換上隨機頭套照的那一戶 */
export const CLOSET_ID = "closet";

/**
 * 服裝間的頭套照片池（芭樂頭套系列，同一批動物）。
 * 每次開門隨機抽一張，像是撞見誰正在試裝。
 */
export const costumeImages: string[] = ["bear", "tabby", "dog", "calico", "bluecat"].map(
  (id) => asset(`characters/costumes/${id}-guava.png`),
);
