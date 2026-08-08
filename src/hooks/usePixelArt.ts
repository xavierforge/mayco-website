import { useEffect, useState } from "react";
import {
  pixelateEmoji,
  pixelateImage,
  pixelateText,
  type PixelOptions,
  type PixelTextResult,
} from "../lib/pixelate";

/**
 * 像素素材的 React 介面。
 *
 * 顯示尺寸一律用「source 格數 × 整數倍」算出來，格子才會對齊實體像素；
 * useDisplayScale 就是那個整數倍（手機 3 倍、桌機 4 倍）。
 */

const COMPACT_QUERY = "(max-width: 639px)";

/** 顯示倍率：手機 3、桌機 4 */
export function useDisplayScale(): number {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(COMPACT_QUERY).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return compact ? 3 : 4;
}

export interface PixelSource {
  emoji: string;
  /** 有真素材時優先吃圖片，跟站上其他元件同一個慣例 */
  img?: string;
}

/** 取得一張像素 sprite 的 dataURL；畫不出來（例如沒有 canvas）時回傳 null */
export function usePixelSprite(source: PixelSource, options: PixelOptions = {}): string | null {
  const { emoji, img } = source;
  const { source: box, scale } = options;
  const [sprite, setSprite] = useState<string | null>(null);

  useEffect(() => {
    if (img) {
      let alive = true;
      pixelateImage(img, { source: box, scale }).then((result) => {
        if (alive) setSprite(result);
      });
      return () => {
        alive = false;
      };
    }
    setSprite(pixelateEmoji(emoji, { source: box, scale }));
  }, [emoji, img, box, scale]);

  return sprite;
}

/**
 * 像素標題。
 * 要等字型載完才畫，不然會用系統預設字型畫出來、之後也不會自己更新。
 */
export function usePixelText(
  text: string,
  options: PixelOptions & { fontSize?: number; color?: string } = {},
): PixelTextResult | null {
  const { fontSize, color, scale } = options;
  const [result, setResult] = useState<PixelTextResult | null>(null);

  useEffect(() => {
    let alive = true;
    const draw = () => {
      if (alive) setResult(pixelateText(text, { fontSize, color, scale }));
    };
    const fonts = document.fonts;
    if (fonts?.ready) {
      fonts.ready.then(draw);
    } else {
      draw();
    }
    return () => {
      alive = false;
    };
  }, [text, fontSize, color, scale]);

  return result;
}
