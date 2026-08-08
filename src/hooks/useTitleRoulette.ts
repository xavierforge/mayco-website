import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * 標題輪盤。
 *
 * 標題平常只是很輕微地逐格晃動，偶爾會「中獎」跳一個明顯的動作。
 * 每一輪結束時用加權隨機（5:1:1）決定下一輪要播哪一個變體，
 * 所以大部分時間都是常態微搖，稀有變體出現時才會嚇你一跳。
 *
 * 動畫本身是 CSS 的 steps() 逐格 keyframes（見 index.css），
 * 這個 hook 只負責換 className；不用 canvas，那是留給真 GIF 的做法。
 */

interface RouletteVariant {
  className: string;
  /** 中獎權重 */
  weight: number;
  /** 一輪播多久（= CSS 動畫時長 × 循環次數），時間到就重抽 */
  roundMs: number;
}

const VARIANTS: RouletteVariant[] = [
  // 常態微搖：0.8s 一圈 × 3 圈
  { className: "title-idle", weight: 5, roundMs: 2400 },
  // 稀有大彈跳：0.72s 一圈 × 4 圈
  { className: "title-jump", weight: 1, roundMs: 2880 },
  // 稀有歪頭：0.84s 一圈 × 3 圈
  { className: "title-tilt", weight: 1, roundMs: 2520 },
];

const TOTAL_WEIGHT = VARIANTS.reduce((sum, v) => sum + v.weight, 0);

function spin(): RouletteVariant {
  let ticket = Math.random() * TOTAL_WEIGHT;
  for (const variant of VARIANTS) {
    ticket -= variant.weight;
    if (ticket <= 0) return variant;
  }
  return VARIANTS[0];
}

/** 回傳目前該套在標題上的 className；使用者要求減少動態時回傳空字串 */
export function useTitleRoulette(): string {
  const prefersReduced = useReducedMotion();
  const [variant, setVariant] = useState<RouletteVariant>(VARIANTS[0]);

  useEffect(() => {
    if (prefersReduced) return;

    let timer = 0;
    const next = (current: RouletteVariant) => {
      timer = window.setTimeout(() => {
        const upcoming = spin();
        setVariant(upcoming);
        next(upcoming);
      }, current.roundMs);
    };
    next(VARIANTS[0]);

    return () => clearTimeout(timer);
  }, [prefersReduced]);

  return prefersReduced ? "" : variant.className;
}
