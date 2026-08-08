import { heroDecorations } from "../data/site";

/**
 * 角落搖搖裝飾。
 *
 * 四個角落各放一個 Mayco 調性的小符號，套上最慢的一組 steps() 搖擺
 * （1.6s 四格 ≈ 2.5fps），就像背景在慢慢呼吸。
 * 純裝飾，pointer-events 關掉，z 層壓在光點之上、探頭動物之下。
 */
export function Shakers({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[5] overflow-hidden ${className}`}
    >
      {heroDecorations.map((deco) => (
        <span
          key={deco.emoji}
          className="shaker absolute block leading-none opacity-70"
          style={{
            ...deco.position,
            animationDelay: `${deco.delay}s`,
            // 手機縮到七成，免得四個角落都被符號占滿
            fontSize: `clamp(${Math.round(deco.size * 0.7)}px, 4vw, ${deco.size}px)`,
          }}
        >
          {deco.emoji}
        </span>
      ))}
    </div>
  );
}
