import { usePixelSprite, type PixelSource } from "../../hooks/usePixelArt";

interface PixelSpriteProps extends PixelSource {
  /** 壓成幾格見方 */
  box: number;
  /** 顯示倍率；顯示寬度 = box × displayScale，保證每格對齊實體像素 */
  displayScale: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 一張像素 sprite。
 * 沒有 canvas 可用時（例如測試環境）退回直接顯示 emoji，版面尺寸不變。
 */
export function PixelSprite({
  emoji,
  img,
  box,
  displayScale,
  alt = "",
  className = "",
  style,
}: PixelSpriteProps) {
  const sprite = usePixelSprite({ emoji, img }, { source: box });
  const size = box * displayScale;

  if (!sprite) {
    return (
      <span
        aria-hidden={alt === "" ? true : undefined}
        className={`inline-flex items-center justify-center leading-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.86, ...style }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={sprite}
      alt={alt}
      draggable={false}
      className={`pixelated block ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}
