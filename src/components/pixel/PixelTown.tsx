import { useCallback, useEffect, useRef, useState } from "react";
import { PixelSprite } from "./PixelSprite";
import { useDisplayScale } from "../../hooks/usePixelArt";
import { useTownResidents } from "../../hooks/useTownResidents";
import type { Character } from "../../data/characters";
import {
  backdropProps,
  clouds,
  fallbackLine,
  foregroundProps,
  residentLines,
  townIntro,
  townProps,
  type TownProp,
} from "../../data/pixelTown";

/**
 * 像素小鎮的場景（2.5D）。
 *
 * 地面帶是一個有縱深的平面：居民的 depth（0 最近、1 最深）決定三件事 ——
 * 腳底線畫在多高、sprite 多大、以及跟場景物件之間誰蓋住誰。
 * 遮擋用最老派的 painter's algorithm：腳底線越靠下（越近）z-index 越高，
 * 而且房子、樹、花跟居民全都吃同一套排序，所以居民走到房子的腳底線後面就會被擋住。
 */

/** 對話框幾秒後自己關掉 */
const TALK_MS = 4000;

/** 居民 sprite 的格數 */
const RESIDENT_BOX = 24;

/** 腳底線的範圍（距離地面帶底部的 px）：depth 0 → 10、depth 1 → 150 */
const NEAR_FOOT = 10;
const FAR_FOOT = 150;

/** 最深處縮到多小（近處為 1.0） */
const FAR_RATIO = 0.6;

/** depth → 腳底線高度 */
const footOf = (depth: number) => NEAR_FOOT + depth * (FAR_FOOT - NEAR_FOOT);

/**
 * depth → sprite 顯示寬度。
 * 近處是 box 的整數倍（格子完全對齊），往深處是連續縮小；
 * 因為 image-rendering: pixelated 是最近鄰取樣，縮小後邊緣依然是硬的，不會糊。
 */
const sizeOf = (depth: number, displayScale: number) =>
  Math.round(RESIDENT_BOX * displayScale * (1 - depth * (1 - FAR_RATIO)));

/**
 * 腳底線 → z-index。越近（foot 越小）畫得越上面。
 * 場景物件的 bottom 就是它的腳底線，所以兩者可以直接比較。
 */
const zOf = (foot: number) => Math.round(1000 - foot);

/**
 * 顯示倍率必須是整數，格子才會對齊實體像素；
 * 場景物件的 sizeFactor 先乘上去再四捨五入，最小 2 倍。
 */
const scaleFor = (displayScale: number, factor: number) =>
  Math.max(2, Math.round(displayScale * factor));

function Prop({ prop, displayScale }: { prop: TownProp; displayScale: number }) {
  return (
    <div
      className="absolute -translate-x-1/2"
      style={{ left: `${prop.left}%`, bottom: prop.bottom, zIndex: zOf(prop.bottom) }}
    >
      <PixelSprite
        emoji={prop.emoji}
        box={prop.box}
        displayScale={scaleFor(displayScale, prop.sizeFactor)}
      />
    </div>
  );
}

interface PixelTownProps {
  characters: Character[];
}

export function PixelTown({ characters }: PixelTownProps) {
  const displayScale = useDisplayScale();
  const [talkingId, setTalkingId] = useState<string | null>(null);
  const residents = useTownResidents(characters, talkingId);
  const talkTimerRef = useRef(0);

  const talk = useCallback((id: string) => {
    clearTimeout(talkTimerRef.current);
    setTalkingId((current) => (current === id ? null : id));
    talkTimerRef.current = window.setTimeout(() => setTalkingId(null), TALK_MS);
  }, []);

  // 換頁或元件卸載時把對話框的計時器收掉
  useEffect(() => () => clearTimeout(talkTimerRef.current), []);

  const talking = residents.find((r) => r.character.id === talkingId);

  return (
    <div className="pixel-sky relative h-full min-h-[440px] w-full overflow-hidden sm:min-h-[540px]">
      {/* 天空：雲與太陽慢慢逐格飄 */}
      {clouds.map((cloud) => (
        <div
          key={`${cloud.emoji}-${cloud.left}`}
          className="pixel-cloud absolute -translate-x-1/2"
          style={{
            left: `${cloud.left}%`,
            top: `${cloud.top}%`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <PixelSprite
            emoji={cloud.emoji}
            box={cloud.box}
            displayScale={scaleFor(displayScale, cloud.sizeFactor)}
          />
        </div>
      ))}

      {/* 地面帶：草地 + 地平線接縫。所有有縱深的東西都住在這一層 */}
      <div className="pixel-ground absolute inset-x-0 bottom-0 h-[260px] sm:h-[320px]">
        <div className="pixel-seam absolute inset-x-0 top-0 h-2" />

        {/* 路：鋪在最靠近鏡頭的一段，居民往深處走就會走上草地 */}
        <div className="pixel-path absolute inset-x-0 bottom-0 h-[64px] sm:h-[72px]" />

        {/* 遠景（樹林、山、教堂） */}
        {backdropProps.map((prop) => (
          <Prop key={`bg-${prop.emoji}-${prop.left}`} prop={prop} displayScale={displayScale} />
        ))}

        {/* 小鎮本體：居民可以走到它們後面 */}
        {townProps.map((prop) => (
          <Prop key={`town-${prop.emoji}-${prop.left}`} prop={prop} displayScale={displayScale} />
        ))}

        {/* 路邊的花與招牌 */}
        {foregroundProps.map((prop) => (
          <Prop key={`fg-${prop.emoji}-${prop.left}`} prop={prop} displayScale={displayScale} />
        ))}

        {/* 居民：z-index 跟場景物件同一套算法，所以會互相遮擋 */}
        {residents.map((resident) => {
          const foot = footOf(resident.depth);
          const size = sizeOf(resident.depth, displayScale);
          return (
            <button
              key={resident.character.id}
              type="button"
              onClick={() => talk(resident.character.id)}
              aria-label={`跟${resident.character.name.zh}說話`}
              className="absolute -translate-x-1/2 cursor-pointer"
              style={{
                left: `${resident.x}%`,
                bottom: foot,
                width: size,
                height: size,
                zIndex: zOf(foot),
              }}
            >
              {/* 外層定位、內層做逐格的翻面／彈跳／轉圈，兩個 transform 分開才不會打架 */}
              <span
                className="block"
                style={{
                  transform: `translateY(${resident.offsetY}px) rotate(${resident.rotation}deg) scaleX(${resident.dir})`,
                  // 空氣透視：越深越淡越亮一點點。用 filter 不會糊掉像素邊緣
                  filter: `saturate(${(1 - 0.3 * resident.depth).toFixed(2)}) brightness(${(1 + 0.07 * resident.depth).toFixed(2)})`,
                }}
              >
                <PixelSprite
                  emoji={resident.character.emoji}
                  img={resident.character.img}
                  box={RESIDENT_BOX}
                  displayScale={size / RESIDENT_BOX}
                />
              </span>
            </button>
          );
        })}

        {/* 對話框：只有真的點了居民才會存在，沒選中時 DOM 裡完全沒有這個節點。
            位置貼著那隻居民的螢幕座標與大小走，浮在場景內。 */}
        {talking && (
          <div
            className="pixel-panel pixel-bubble pixel-pop absolute w-52 px-3 py-2 text-left sm:w-56"
            style={{
              // 貼邊時夾住，免得對話框被場景邊緣切掉
              left: `${Math.min(Math.max(talking.x, 20), 80)}%`,
              bottom: footOf(talking.depth) + sizeOf(talking.depth, displayScale) + 14,
              zIndex: 3000,
            }}
          >
            <p className="text-xs font-black text-mayco">{talking.character.name.zh}</p>
            <p className="mt-1 text-[13px] leading-5 text-stone-700">
              {residentLines[talking.character.id] ?? fallbackLine}
            </p>
          </div>
        )}
      </div>

      <p className="absolute inset-x-0 bottom-2 z-[3001] text-center text-[11px] font-bold text-stone-600/80">
        {townIntro.hint}
      </p>
    </div>
  );
}
