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
 * 那個整數倍由用的人決定（首頁的公寓用 useSceneScale 由內容需求反推）。
 */

/**
 * 讀 <html> 上的 CSS 變數，並在 data-theme 變動時重讀。
 *
 * canvas 產生的素材（像素標題）是把顏色烤進 dataURL 的，
 * 不像 CSS 那樣會自己跟著主題翻面，所以需要主動知道主題換了、重畫一張。
 */
function useThemeToken(name: string): string | undefined {
  const [value, setValue] = useState<string | undefined>(() => {
    if (typeof document === "undefined") return undefined;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;
  });

  useEffect(() => {
    const read = () =>
      setValue(
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined,
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [name]);

  return value;
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
 * 沒有指定顏色時吃主題的主色，主題換了會重畫（顏色是烤進 dataURL 的）。
 */
export function usePixelText(
  text: string,
  options: PixelOptions & { fontSize?: number; color?: string } = {},
): PixelTextResult | null {
  const { fontSize, color, scale } = options;
  const themeColor = useThemeToken("--color-mayco");
  const inkColor = color ?? themeColor;
  const [result, setResult] = useState<PixelTextResult | null>(null);

  useEffect(() => {
    let alive = true;
    const draw = () => {
      if (alive) setResult(pixelateText(text, { fontSize, color: inkColor, scale }));
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
  }, [text, fontSize, inkColor, scale]);

  return result;
}
