import { useCallback, useEffect, useRef, useState } from "react";
import { Bodies, Body, Composite, Constraint, Engine } from "matter-js";

/**
 * 物理樂園的核心。
 *
 * 所有數值都是反覆實測調出來的手感參數，
 * 與專案根目錄 demo.html 的 vanilla 實作逐字一致，請勿隨意調整：
 * 動一個數字整個手感就跑掉了。
 */

/** 固定時步 */
const STEP = 1000 / 60;
/** 掉幀時最多補幾步，避免切分頁回來一次爆衝 */
const MAX_SUBSTEPS = 3;
/** 單幀最多累積的時間 */
const MAX_FRAME_MS = 100;

const BODY_OPTS = {
  restitution: 0.65,
  frictionAir: 0.018,
  friction: 0.05,
  density: 4e-4,
} as const;

/** 回位彈簧（只作用於 y 軸；x 軸完全自由，這是手感關鍵） */
const SPRING_K = -6e-5;
const SPRING_DAMP = -0.003;

/** 甩出：取最後 80ms 的指標軌跡，速度 ×1.5 */
const FLING_WINDOW = 80;
const FLING_SCALE = 1.5;

/** 拖曳 constraint */
const DRAG_STIFFNESS = 0.9;
const DRAG_DAMPING = 0.05;

/** 圓角比例（chamfer） */
const CHAMFER_RATIO = 0.3;

/** 點標題散開時的速度係數 */
const SCATTER_K = 0.05;

const isMobile = () => window.innerWidth < 768;
/** 角色基準半徑：桌機 72、手機 36 */
const baseHalf = () => (isMobile() ? 36 : 72);

/** 物理引擎眼中的角色規格；只取形狀相關欄位，與資料層的其他欄位解耦 */
export interface PhysicsSpec {
  /** 寬 / 高 */
  aspect: number;
  scale: number;
}

/** 每個角色的 DOM 尺寸，交給 React 畫盒子 */
export interface CharBox {
  width: number;
  height: number;
}

export interface PhysicsHandle {
  /** 掛在舞台容器上；物理世界的邊界就是這個容器 */
  stageRef: React.RefObject<HTMLDivElement | null>;
  /** 角色 DOM 的 ref callback，index 對應 specs 的順序 */
  registerElement: (index: number, el: HTMLElement | null) => void;
  /** 在角色上 pointerdown 時呼叫 */
  startDrag: (index: number, e: { clientX: number; clientY: number }) => void;
  /** 指標移動；元件正常情況不用自己接，hook 內部已監聽 window */
  moveDrag: (e: { clientX: number; clientY: number }) => void;
  /** 放開指標，依軌跡甩出 */
  endDrag: () => void;
  /** 全員彈跳散開再飄回（點標題的彩蛋） */
  scatter: () => void;
  /** 每個角色的盒子尺寸，初始化完成後才有值 */
  boxes: CharBox[];
  /** 目前是否正在拖曳（用來切游標樣式） */
  draggingIndex: number | null;
}

interface CharState {
  body: Body;
  restY: number;
}

interface PointerSample {
  x: number;
  y: number;
  t: number;
}

/** 四面隱形牆的位置與尺寸 */
function wallSpecs(w: number, h: number): [number, number, number, number][] {
  return [
    [w / 2, -50, w + 200, 100],
    [w / 2, h + 50, w + 200, 100],
    [-50, h / 2, 100, h + 200],
    [w + 50, h / 2, 100, h + 200],
  ];
}

/** 角色的回位高度：靠近舞台底部，每三個錯開一層 */
function restYFor(index: number, stageHeight: number): number {
  return stageHeight - (isMobile() ? 60 : 120) - (index % 3) * 45;
}

function boxFor(spec: PhysicsSpec, half: number): CharBox {
  const width = (spec.aspect >= 1 ? 2 * half : 2 * half * spec.aspect) * spec.scale;
  const height = (spec.aspect >= 1 ? (2 * half) / spec.aspect : 2 * half) * spec.scale;
  return { width, height };
}

export function usePhysics(specs: PhysicsSpec[]): PhysicsHandle {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const charsRef = useRef<CharState[]>([]);
  const engineRef = useRef<Engine | null>(null);

  const dragConstraintRef = useRef<Constraint | null>(null);
  const dragBodyRef = useRef<Body | null>(null);
  const historyRef = useRef<PointerSample[]>([]);

  const [boxes, setBoxes] = useState<CharBox[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // specs 在資料層是常數，用 ref 讓 effect 不必把它列進依賴
  const specsRef = useRef(specs);
  specsRef.current = specs;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const currentSpecs = specsRef.current;
    const engine = Engine.create({ gravity: { x: 0, y: 0 } }); // 零重力，靠彈簧回位
    engineRef.current = engine;

    let stageW = stage.clientWidth;
    let stageH = stage.clientHeight;

    const walls = wallSpecs(stageW, stageH).map(([x, y, w, h]) =>
      Bodies.rectangle(x, y, w, h, { isStatic: true, restitution: 0.65 }),
    );
    Composite.add(engine.world, walls);

    const half = baseHalf();
    const nextBoxes = currentSpecs.map((spec) => boxFor(spec, half));

    const chars: CharState[] = currentSpecs.map((_, i) => {
      const { width, height } = nextBoxes[i];
      const laneX = (stageW / (currentSpecs.length + 1)) * (i + 1);
      // 從舞台下方飛進來
      const body = Bodies.rectangle(laneX, stageH + 200 + 30 * i, width, height, {
        ...BODY_OPTS,
        chamfer: { radius: CHAMFER_RATIO * Math.min(width, height) },
        label: `char-${i}`,
      });
      Composite.add(engine.world, body);
      return { body, restY: restYFor(i, stageH) };
    });

    charsRef.current = chars;
    setBoxes(nextBoxes);

    const applySprings = () => {
      for (const c of chars) {
        if (c.body === dragBodyRef.current) continue;
        const dy = c.body.position.y - c.restY;
        Body.applyForce(c.body, c.body.position, {
          x: 0,
          y: SPRING_K * dy + SPRING_DAMP * c.body.velocity.y,
        });
      }
    };

    let last = performance.now();
    let acc = 0;
    let raf = 0;

    const tick = (now: number) => {
      acc += Math.min(now - last, MAX_FRAME_MS);
      last = now;

      let n = 0;
      while (acc >= STEP && n < MAX_SUBSTEPS) {
        applySprings();
        Engine.update(engine, STEP);
        acc -= STEP;
        n++;
      }
      if (acc >= STEP) acc = 0;

      // 邊界保險夾限：constraint 甩太猛時防止穿牆
      const margin = (4 * baseHalf()) / 3;
      for (const c of chars) {
        const p = c.body.position;
        const x = Math.min(Math.max(p.x, margin), stageW - margin);
        const y = Math.min(Math.max(p.y, margin), stageH - margin);
        if (x !== p.x || y !== p.y) {
          Body.setPosition(c.body, { x, y });
          Body.setVelocity(c.body, {
            x: x !== p.x ? 0 : c.body.velocity.x,
            y: y !== p.y ? 0 : c.body.velocity.y,
          });
        }
      }

      // 物理 → DOM：直接寫 transform，不走 canvas，圖片永遠是清晰的
      for (let i = 0; i < chars.length; i++) {
        const el = elementsRef.current[i];
        if (!el) continue;
        const p = chars[i].body.position;
        el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const handleResize = () => {
      const nextW = stage.clientWidth;
      const nextH = stage.clientHeight;
      if (nextW === stageW && nextH === stageH) return;
      stageW = nextW;
      stageH = nextH;
      wallSpecs(stageW, stageH).forEach(([x, y, w, h], i) => {
        Body.setPosition(walls[i], { x, y });
        Body.setVertices(walls[i], Bodies.rectangle(x, y, w, h).vertices);
      });
      chars.forEach((c, i) => {
        c.restY = restYFor(i, stageH);
      });
    };

    window.addEventListener("resize", handleResize);
    // 舞台高度是 100dvh 之類的相對值，視窗以外的版面變動也要跟上
    const observer = new ResizeObserver(handleResize);
    observer.observe(stage);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engineRef.current = null;
      charsRef.current = [];
      dragConstraintRef.current = null;
      dragBodyRef.current = null;
      historyRef.current = [];
    };
  }, []);

  const registerElement = useCallback((index: number, el: HTMLElement | null) => {
    elementsRef.current[index] = el;
    // 立刻寫一次 transform，避免元素在第一幀之前閃在左上角
    const char = charsRef.current[index];
    if (el && char) {
      const p = char.body.position;
      el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
    }
  }, []);

  /**
   * 指標的 client 座標 → 舞台內部座標。
   * demo.html 的舞台是 position:fixed inset:0，兩者相等；
   * 這裡舞台被導覽列往下推、頁面還能捲動，所以一定要扣掉舞台的位置。
   */
  const stagePoint = useCallback((e: { clientX: number; clientY: number }) => {
    const stage = stageRef.current;
    if (!stage) return { x: e.clientX, y: e.clientY };
    const rect = stage.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDrag = useCallback(
    (index: number, e: { clientX: number; clientY: number }) => {
      const engine = engineRef.current;
      const char = charsRef.current[index];
      if (!engine || !char) return;

      const { x, y } = stagePoint(e);
      dragBodyRef.current = char.body;
      historyRef.current = [{ x, y, t: performance.now() }];

      const constraint = Constraint.create({
        pointA: { x, y },
        bodyB: char.body,
        pointB: { x: 0, y: 0 },
        stiffness: DRAG_STIFFNESS,
        damping: DRAG_DAMPING,
        length: 0,
      });
      dragConstraintRef.current = constraint;
      Composite.add(engine.world, constraint);
      setDraggingIndex(index);
    },
    [stagePoint],
  );

  const moveDrag = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const constraint = dragConstraintRef.current;
      if (!constraint) return;
      const { x, y } = stagePoint(e);
      constraint.pointA = { x, y };
      const now = performance.now();
      const history = historyRef.current;
      history.push({ x, y, t: now });
      while (history.length > 1 && now - history[0].t > FLING_WINDOW) history.shift();
    },
    [stagePoint],
  );

  const endDrag = useCallback(() => {
    const engine = engineRef.current;
    const constraint = dragConstraintRef.current;
    if (!engine || !constraint) return;

    const body = dragBodyRef.current;
    const history = historyRef.current;
    if (body && history.length >= 2) {
      const a = history[0];
      const b = history[history.length - 1];
      const dt = (b.t - a.t) / 1000;
      if (dt > 0.005) {
        Body.setVelocity(body, {
          x: ((b.x - a.x) / dt) * (1 / 60) * FLING_SCALE,
          y: ((b.y - a.y) / dt) * (1 / 60) * FLING_SCALE,
        });
      }
    }

    Composite.remove(engine.world, constraint);
    dragConstraintRef.current = null;
    dragBodyRef.current = null;
    historyRef.current = [];
    setDraggingIndex(null);
  }, []);

  const scatter = useCallback(() => {
    const stage = stageRef.current;
    const chars = charsRef.current;
    if (!stage || chars.length === 0) return;

    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;

    const targets = chars.map((_, i) => ({
      x: (stageW / (chars.length + 1)) * (i + 1),
      y: baseHalf() + 0.5 * stageH * Math.random(),
    }));
    // 洗牌，讓每次散開的落點都不一樣
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    chars.forEach((c, i) => {
      const k = SCATTER_K * (0.8 + 0.4 * Math.random());
      Body.setVelocity(c.body, {
        x: (targets[i].x - c.body.position.x) * k,
        y: (targets[i].y - c.body.position.y) * k,
      });
    });
  }, []);

  // 指標移動與放開一律掛在 window 上：手指／滑鼠甩出舞台外也追得到
  useEffect(() => {
    const onMove = (e: PointerEvent) => moveDrag(e);
    const onUp = () => endDrag();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [moveDrag, endDrag]);

  return {
    stageRef,
    registerElement,
    startDrag,
    moveDrag,
    endDrag,
    scatter,
    boxes,
    draggingIndex,
  };
}
