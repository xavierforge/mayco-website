import { useMemo } from "react";

/**
 * 陽光光點背景。
 *
 * ☀ 是美可女子的品牌符號，這裡把它散成一層暖黃色的小點點／花瓣，
 * 鋪在各頁的底層當裝飾。用固定種子的 LCG 產生位置，
 * 所以重新整理、換頁回來，光點都長在同一個地方，不會閃來閃去。
 */

interface SparklesProps {
  /** 光點數量 */
  count?: number;
  /** 亂數種子；同一個種子永遠得到同一組排列 */
  seed?: number;
  /** 整體透明度倍率，內容多的頁面可以調低 */
  intensity?: number;
  className?: string;
}

/** 暖色系：陽光黃 → 蜜橘 → 淡花瓣粉 */
const TINTS = ["#f2b544", "#f0c46a", "#e8934a", "#f2a97e"];

interface Sparkle {
  left: string;
  top: string;
  width: number;
  height: number;
  background: string;
  opacity: number;
  rotate: number;
}

function buildSparkles(count: number, seed: number, intensity: number): Sparkle[] {
  let s = seed;
  // Lehmer / minimal standard LCG（乘數 16807、模數 2^31-1）：同一個 seed 永遠產出同一組火花
  const rand = () => ((s = (16807 * s) % 2147483647) - 1) / 2147483646;

  const out: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    const size = 4 + rand() * 8;
    out.push({
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      width: size,
      height: size * (0.6 + rand() * 0.8),
      background: TINTS[Math.floor(rand() * TINTS.length)],
      opacity: (0.15 + rand() * 0.2) * intensity,
      rotate: rand() * 360,
    });
  }
  return out;
}

export function Sparkles({
  count = 36,
  seed = 42,
  intensity = 1,
  className = "",
}: SparklesProps) {
  const sparkles = useMemo(
    () => buildSparkles(count, seed, intensity),
    [count, seed, intensity],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {sparkles.map((sp, i) => (
        <span
          key={i}
          className="absolute block"
          style={{
            left: sp.left,
            top: sp.top,
            width: sp.width,
            height: sp.height,
            background: sp.background,
            opacity: sp.opacity,
            borderRadius: "40%",
            transform: `rotate(${sp.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
