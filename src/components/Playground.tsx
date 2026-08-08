import { useCallback, useEffect, useRef } from "react";
import { usePhysics } from "../hooks/usePhysics";
import type { Character } from "../data/characters";

interface PlaygroundProps {
  characters: Character[];
  /** 點（不是拖）角色時觸發，用來開介紹卡 */
  onSelect: (character: Character) => void;
  /** 舞台中央的內容：標題那一塊。點它會讓全員散開 */
  children?: (api: { scatter: () => void }) => React.ReactNode;
  className?: string;
}

/** 位移超過這個距離就算「拖曳」而不是「點擊」 */
const TAP_SLOP = 8;
/** 按住超過這麼久也不算點擊 */
const TAP_MAX_MS = 500;

interface PressState {
  index: number;
  x: number;
  y: number;
  t: number;
  moved: number;
}

export function Playground({
  characters,
  onSelect,
  children,
  className = "",
}: PlaygroundProps) {
  const { stageRef, registerElement, startDrag, scatter, boxes, draggingIndex } =
    usePhysics(characters);

  const pressRef = useRef<PressState | null>(null);

  const handlePointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      e.preventDefault();
      pressRef.current = {
        index,
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        moved: 0,
      };
      startDrag(index, e);
    },
    [startDrag],
  );

  // 用「按下到放開之間幾乎沒移動」來區分點擊與拖曳：
  // 拖曳本身就是主要互動，不能讓它每次放手都彈出介紹卡。
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const press = pressRef.current;
      if (!press) return;
      const dist = Math.hypot(e.clientX - press.x, e.clientY - press.y);
      if (dist > press.moved) press.moved = dist;
    };
    const onUp = () => {
      const press = pressRef.current;
      pressRef.current = null;
      if (!press) return;
      const held = performance.now() - press.t;
      if (press.moved <= TAP_SLOP && held <= TAP_MAX_MS) {
        const character = characters[press.index];
        if (character) onSelect(character);
      }
    };
    const onCancel = () => {
      pressRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [characters, onSelect]);

  return (
    <div
      ref={stageRef}
      className={`relative overflow-hidden select-none ${className}`}
    >
      {children?.({ scatter })}

      {boxes.map((box, i) => {
        const character = characters[i];
        const dragging = draggingIndex === i;
        return (
          <div
            key={character.id}
            ref={(el) => {
              registerElement(i, el);
            }}
            onPointerDown={(e) => handlePointerDown(i, e)}
            role="button"
            tabIndex={0}
            aria-label={character.name.zh}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(character);
              }
            }}
            className={[
              // touch-none 只下在角色身上：手指按著角色是拖曳，
              // 按著背景滑動仍然是捲頁（demo.html 整頁不能捲，這裡是長頁面）
              "group absolute left-0 top-0 flex touch-none items-center justify-center will-change-transform",
              dragging ? "z-30 cursor-grabbing" : "z-20 cursor-grab",
            ].join(" ")}
            style={{ width: box.width, height: box.height }}
          >
            {character.img ? (
              <img
                src={character.img}
                alt={character.name.zh}
                draggable={false}
                className={[
                  "pointer-events-none block h-full w-full object-contain transition-transform duration-150",
                  dragging ? "scale-115" : "group-hover:scale-110",
                ].join(" ")}
                style={{ filter: "drop-shadow(0 4px 6px rgba(120, 80, 40, .25))" }}
              />
            ) : (
              <span
                className={[
                  "pointer-events-none block leading-none transition-transform duration-150",
                  dragging ? "scale-115" : "group-hover:scale-110",
                ].join(" ")}
                style={{
                  fontSize: Math.min(box.width, box.height) * 0.92,
                  filter: "drop-shadow(0 4px 6px rgba(120, 80, 40, .25))",
                }}
              >
                {character.emoji}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
