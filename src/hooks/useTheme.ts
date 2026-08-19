import { useCallback, useEffect, useState } from "react";

/**
 * 明暗主題。
 *
 * 預設跟著使用者當地時間跑：06:00~18:00 是亮色，其餘時間是暗色，
 * 所以晚上進來看到的是夜晚版的公寓（天空、磚牆、亮窗都有另一套顏色）。
 * 使用者按導覽列那顆按鈕可以自己指定，偏好存在 localStorage；
 * 按回 auto 就把偏好清掉，重新交給時間決定。
 *
 * 套用方式是在 <html> 掛 data-theme，顏色怎麼翻面全部寫在 src/index.css，
 * 元件端不需要任何 dark: 變體。
 *
 * ⚠️ index.html 裡有一段同邏輯的 inline script，負責在 React 掛載前先把
 *    data-theme 套上（不然暗色主題會先閃一下亮底）。改這裡的規則要一起改那邊。
 */

export type ThemeMode = "auto" | "light" | "dark";
export type Theme = "light" | "dark";

/** 與 index.html 的 inline script 共用同一個 key */
const STORAGE_KEY = "mayco-theme";

/** 白天的範圍：06:00（含）到 18:00（不含） */
const DAY_START = 6;
const DAY_END = 18;

export const themeForHour = (hour: number): Theme =>
  hour >= DAY_START && hour < DAY_END ? "light" : "dark";

function readMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "auto";
  } catch {
    // 無痕模式等情境會直接丟例外，當作沒有偏好
    return "auto";
  }
}

function writeMode(mode: ThemeMode) {
  try {
    if (mode === "auto") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // 存不進去就算了，這一輪的選擇還是有效
  }
}

export interface ThemeState {
  theme: Theme;
  mode: ThemeMode;
  /** 依序切換 auto → light → dark → auto */
  cycle: () => void;
}

/**
 * 只讀當下的主題。
 *
 * 給「顏色不是 CSS 就能翻面」的東西用（例如 emoji 素材要日夜換一張）。
 * 直接觀察 <html> 的 data-theme，不自己持有偏好狀態，
 * 所以不管畫面上有幾個地方在讀，永遠跟導覽列那顆鈕是同一個答案。
 */
export function useCurrentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

export function useTheme(): ThemeState {
  const [mode, setMode] = useState<ThemeMode>(readMode);
  const [autoTheme, setAutoTheme] = useState<Theme>(() => themeForHour(new Date().getHours()));
  const theme: Theme = mode === "auto" ? autoTheme : mode;

  // 跨過日出／日落就自己換。對齊下一個整點重排，分頁被切回來時也重算一次
  useEffect(() => {
    let timer = 0;

    const tick = () => {
      const now = new Date();
      setAutoTheme(themeForHour(now.getHours()));
      const toNextHour = (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000;
      timer = window.setTimeout(tick, Math.max(60_000, toNextHour));
    };

    const onVisibility = () => {
      if (document.hidden) return;
      clearTimeout(timer);
      tick();
    };

    tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const cycle = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
      writeMode(next);
      return next;
    });
  }, []);

  return { theme, mode, cycle };
}
