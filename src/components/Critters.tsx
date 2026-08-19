import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { CritterAnimal } from "../data/critters";

/**
 * 兩側偶發探頭動物。
 *
 * 每隔一陣子從畫面左右兩條邊帶隨機冒出一隻動物，抖幾下再消失。
 * 動作全部走 CSS 的 steps() 逐格動畫（見 index.css），刻意做成 5~6fps 的
 * 手繪 GIF 抖動感；之後拿到真的 GIF 素材，只要在 critters.ts 填 `img`
 * 就會直接改放圖片，這裡不用動。
 *
 * 探頭的動物是獨立角色池（見 src/data/critters.ts），跟公寓住戶那批主角色不重複。
 */

/** 首次出現的延遲 */
const FIRST_DELAY = 800;
/** 之後每次的間隔：1500 ~ 4000ms */
const GAP_MIN = 1500;
const GAP_RANDOM = 2500;

/** 淡入 300 + 停留 2500 + 淡出 400，與 .critter 的 CSS 動畫時間對齊 */
const LIFETIME = 3200;

/** 桌機／手機的顯示尺寸 */
const SIZE_DESKTOP = 180;
const SIZE_MOBILE = 90;
const MOBILE_MAX_WIDTH = 640;

/** 左右兩條邊帶（%），中間留給主標題 */
const LEFT_BAND = { min: 3, max: 33 };
const RIGHT_BAND = { min: 67, max: 97 };
const TOP_BAND = { min: 20, max: 60 };

/** 四種逐格動作變體，出現時隨機挑一種 */
const VARIANTS = [
  "critter-wiggle",
  "critter-bounce",
  "critter-peek",
  "critter-shiver",
] as const;

interface Critter {
  key: number;
  character: CritterAnimal;
  left: number;
  top: number;
  size: number;
  variant: string;
  /** peek 變體要知道往哪邊探：左側 +1、右側 -1 */
  dir: 1 | -1;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

interface CrittersProps {
  animals: CritterAnimal[];
  className?: string;
}

export function Critters({ animals, className = "" }: CrittersProps) {
  const prefersReduced = useReducedMotion();
  const [critters, setCritters] = useState<Critter[]>([]);

  const timersRef = useRef<Set<number>>(new Set());
  const lastCharIdRef = useRef<string | null>(null);
  const nextKeyRef = useRef(0);

  useEffect(() => {
    if (prefersReduced || animals.length === 0) return;

    const timers = timersRef.current;
    const after = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const spawn = () => {
      // 連續兩次不重複：直接把上一隻從候選池拿掉再抽
      const pool = animals.filter((c) => c.id !== lastCharIdRef.current);
      const character = pick(pool.length > 0 ? pool : animals);
      lastCharIdRef.current = character.id;

      const onLeft = Math.random() < 0.5;
      const band = onLeft ? LEFT_BAND : RIGHT_BAND;
      const key = nextKeyRef.current++;

      setCritters((prev) => [
        ...prev,
        {
          key,
          character,
          left: between(band.min, band.max),
          top: between(TOP_BAND.min, TOP_BAND.max),
          size: window.innerWidth < MOBILE_MAX_WIDTH ? SIZE_MOBILE : SIZE_DESKTOP,
          variant: pick(VARIANTS),
          dir: onLeft ? 1 : -1,
        },
      ]);

      after(LIFETIME, () => {
        setCritters((prev) => prev.filter((c) => c.key !== key));
      });
      after(GAP_MIN + Math.random() * GAP_RANDOM, spawn);
    };

    after(FIRST_DELAY, spawn);

    return () => {
      // 離開首頁時把排程中的計時器全部收掉，不留任何 pending setTimeout
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      setCritters([]);
    };
  }, [animals, prefersReduced]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[15] overflow-hidden ${className}`}
    >
      {critters.map((critter) => (
        <div
          key={critter.key}
          className="critter absolute"
          style={{
            left: `calc(${critter.left}% - ${critter.size / 2}px)`,
            top: `calc(${critter.top}% - ${critter.size / 2}px)`,
            width: critter.size,
            height: critter.size,
          }}
        >
          {/* 內外兩層：外層負責淡入淡出，內層負責逐格動作，兩個 transform 才不會打架 */}
          <div
            className={`flex h-full w-full items-center justify-center ${critter.variant}`}
            style={{ "--dir": critter.dir } as React.CSSProperties}
          >
            {critter.character.img ? (
              <img
                src={critter.character.img}
                alt=""
                className="h-full w-full object-contain"
                style={{ filter: "drop-shadow(0 4px 6px rgba(120, 80, 40, .2))" }}
              />
            ) : (
              <span
                className="block leading-none"
                style={{
                  fontSize: critter.size * 0.9,
                  filter: "drop-shadow(0 4px 6px rgba(120, 80, 40, .2))",
                }}
              >
                {critter.character.emoji}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
