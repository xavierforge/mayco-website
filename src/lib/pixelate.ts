/**
 * 把 emoji／圖片／文字變成真正的像素 sprite。
 *
 * 手法：先畫到一張「極小」的畫布（20~28px，等於直接把圖壓成那麼多格），
 * 再用 imageSmoothingEnabled = false 放大好幾倍。關掉平滑等於最近鄰插值，
 * 每一格會被完整複製成一個大方塊，就是貨真價實的馬賽克，
 * 而不是把圖模糊放大再假裝是像素。
 *
 * 產物是 dataURL，交給 <img> 搭配 image-rendering: pixelated 顯示；
 * 只要顯示寬度是 source 的整數倍，每一格就會剛好對齊實體像素，邊緣不會糊掉。
 */

export interface PixelOptions {
  /** 壓成幾格見方（越小越馬賽克） */
  source?: number;
  /** 放大倍率 */
  scale?: number;
}

const DEFAULT_SOURCE = 24;
const DEFAULT_SCALE = 6;

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

/** 同樣的素材不用重畫，整站共用一份快取 */
const cache = new Map<string, string | null>();

function createCanvas(width: number, height: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** 關鍵步驟：關掉平滑，把小畫布整張放大 */
function upscale(small: HTMLCanvasElement, scale: number): string | null {
  const big = createCanvas(small.width * scale, small.height * scale);
  const ctx = big?.getContext("2d");
  if (!big || !ctx) return null;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, big.width, big.height);
  return big.toDataURL();
}

/** emoji → 像素 sprite */
export function pixelateEmoji(emoji: string, options: PixelOptions = {}): string | null {
  const source = options.source ?? DEFAULT_SOURCE;
  const scale = options.scale ?? DEFAULT_SCALE;
  const key = `emoji:${emoji}:${source}:${scale}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const small = createCanvas(source, source);
  const ctx = small?.getContext("2d");
  if (!small || !ctx) {
    cache.set(key, null);
    return null;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // 留一點邊，免得 emoji 的外框被裁掉
  ctx.font = `${Math.round(source * 0.86)}px ${EMOJI_FONT}`;
  ctx.fillText(emoji, source / 2, source / 2);

  const result = upscale(small, scale);
  cache.set(key, result);
  return result;
}

/**
 * 圖片 → 像素 sprite。
 * 之後把真的角色去背 PNG 放進 characters.ts 的 `img`，會走這條路徑，
 * 一樣先壓成 source 格再放大，跟 emoji 的處理完全一致。
 */
export function pixelateImage(
  src: string,
  options: PixelOptions = {},
): Promise<string | null> {
  const source = options.source ?? DEFAULT_SOURCE;
  const scale = options.scale ?? DEFAULT_SCALE;
  const key = `img:${src}:${source}:${scale}`;
  const hit = cache.get(key);
  if (hit !== undefined) return Promise.resolve(hit);

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const small = createCanvas(source, source);
      const ctx = small?.getContext("2d");
      if (!small || !ctx) {
        cache.set(key, null);
        resolve(null);
        return;
      }
      // 等比縮到小畫布裡置中，長寬比不會被壓扁
      const ratio = Math.min(source / image.width, source / image.height);
      const w = image.width * ratio;
      const h = image.height * ratio;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, (source - w) / 2, (source - h) / 2, w, h);

      const result = upscale(small, scale);
      cache.set(key, result);
      resolve(result);
    };
    image.onerror = () => {
      cache.set(key, null);
      resolve(null);
    };
    image.src = src;
  });
}

export interface PixelTextResult {
  src: string;
  /** 小畫布的尺寸；顯示時用它的整數倍才會對齊格線 */
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * 文字 → 像素字。
 * 中文字在 20px 左右畫出來再放大，筆畫會自然崩成方塊，就是 8-bit 標題的味道。
 */
export function pixelateText(
  text: string,
  options: PixelOptions & { fontSize?: number; color?: string; font?: string } = {},
): PixelTextResult | null {
  const fontSize = options.fontSize ?? 22;
  const scale = options.scale ?? DEFAULT_SCALE;
  const color = options.color ?? "#e8622d";
  const family = options.font ?? '"Noto Sans TC", sans-serif';
  const font = `900 ${fontSize}px ${family}`;
  const key = `text:${text}:${font}:${color}:${scale}`;

  const measurer = createCanvas(1, 1);
  const mctx = measurer?.getContext("2d");
  if (!mctx) return null;
  mctx.font = font;
  const width = Math.ceil(mctx.measureText(text).width) + 2;
  const height = Math.ceil(fontSize * 1.3);

  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached ? { src: cached, sourceWidth: width, sourceHeight: height } : null;
  }

  const small = createCanvas(width, height);
  const ctx = small?.getContext("2d");
  if (!small || !ctx) return null;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);

  const result = upscale(small, scale);
  cache.set(key, result);
  return result ? { src: result, sourceWidth: width, sourceHeight: height } : null;
}
