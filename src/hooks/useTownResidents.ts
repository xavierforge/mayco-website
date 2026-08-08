import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { Character } from "../data/characters";

/**
 * 小鎮居民的走動模擬（2.5D）。
 *
 * 居民在地面帶上是一個平面：x 是左右、depth 是縱深（0 = 最靠近鏡頭、1 = 最深處）。
 * 他們會在整個平面裡隨機挑一個點走過去，所以會往畫面深處走、走到房子後面。
 * 深度怎麼換算成大小與前後順序是畫面的事，交給 PixelTown 決定，這裡只管座標。
 *
 * 刻意用 5fps 的 setInterval 推進而不是 rAF：位置一次跳一大格，
 * 加上 sprite 沒有任何 CSS transition，看起來就是老遊戲的逐格移動。
 */

/** 5fps：落在需求的 4~6fps 中間 */
export const TICK_MS = 200;

/** 走動範圍（場景寬度的百分比） */
const MIN_X = 4;
const MAX_X = 92;
/** 縱深範圍 */
const MIN_D = 0;
const MAX_D = 1;

/** 每格前進多少（再乘上各自的速度）：x 是 %、depth 是 0~1 */
const X_STEP = 1.1;
const D_STEP = 0.05;

/** 一次最多走多遠，免得一趟走太久 */
const X_RANGE = 30;
const D_RANGE = 0.45;

/** 發呆幾格：5~15 格 = 1~3 秒 */
const IDLE_TICKS = { min: 5, max: 15 };

/** 發呆結束後耍寶的機率（低機率小事件） */
const TRICK_CHANCE = 0.15;

/** 跳一下的四格 y 位移 */
const JUMP_FRAMES = [-10, -14, -6, 0];
/** 原地轉圈：每格轉 90 度，四格一圈 */
const SPIN_STEP = 90;

/** 減少動態時，居民靜靜站在這三層深度上，層次感還在 */
const STILL_DEPTHS = [0.12, 0.52, 0.85];

export type Pose = "stand" | "walk-a" | "walk-b" | "jump" | "spin";

export interface Resident {
  character: Character;
  /** 場景寬度百分比 */
  x: number;
  /** 縱深：0 最近、1 最深 */
  depth: number;
  /** 面向：1 朝右、-1 朝左（只看 x 方向分量） */
  dir: 1 | -1;
  pose: Pose;
  /** 走路 bob 或跳躍高度 */
  offsetY: number;
  /** 轉圈角度 */
  rotation: number;
}

type Phase = "walk" | "idle" | "jump" | "spin";

interface ResidentState extends Resident {
  phase: Phase;
  /** idle / jump / spin 還剩幾格 */
  left: number;
  targetX: number;
  targetD: number;
  speed: number;
  bob: boolean;
  frame: number;
}

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** 在附近的平面上挑一個新的目標點 */
function pickTarget(r: ResidentState) {
  r.targetX = clamp(r.x + (Math.random() * 2 - 1) * X_RANGE, MIN_X, MAX_X);
  r.targetD = clamp(r.depth + (Math.random() * 2 - 1) * D_RANGE, MIN_D, MAX_D);
}

function startWalk(r: ResidentState) {
  r.phase = "walk";
  r.rotation = 0;
  pickTarget(r);
}

function startIdle(r: ResidentState) {
  r.phase = "idle";
  r.left = randInt(IDLE_TICKS.min, IDLE_TICKS.max);
  r.pose = "stand";
  r.offsetY = 0;
  r.rotation = 0;
}

function createResident(character: Character, index: number, total: number): ResidentState {
  // 開場先散開：x 平均分佈，深度輪流放在三層，一眼就看得出有前後
  const x = MIN_X + ((MAX_X - MIN_X) / (total + 1)) * (index + 1);
  const depth = STILL_DEPTHS[index % STILL_DEPTHS.length];
  const state: ResidentState = {
    character,
    x,
    depth,
    dir: Math.random() < 0.5 ? 1 : -1,
    pose: "stand",
    offsetY: 0,
    rotation: 0,
    phase: "idle",
    left: randInt(1, IDLE_TICKS.max),
    targetX: x,
    targetD: depth,
    speed: 0.8 + Math.random() * 0.7,
    bob: false,
    frame: 0,
  };
  return state;
}

/** 推進一格 */
function advance(r: ResidentState) {
  switch (r.phase) {
    case "walk": {
      const dx = r.targetX - r.x;
      const dd = r.targetD - r.depth;
      // 換算成「還要幾格」，取比較遠的那一軸當主導，兩軸就會沿直線一起前進
      const stepsX = Math.abs(dx) / (X_STEP * r.speed);
      const stepsD = Math.abs(dd) / (D_STEP * r.speed);
      const steps = Math.max(stepsX, stepsD);

      if (steps <= 1) {
        r.x = r.targetX;
        r.depth = r.targetD;
        startIdle(r);
        break;
      }

      const nextX = r.x + dx / steps;
      // 翻面只看 x 方向分量；純粹往深處走時維持原本面向
      if (Math.abs(nextX - r.x) > 0.05) r.dir = nextX > r.x ? 1 : -1;
      r.x = clamp(nextX, MIN_X, MAX_X);
      r.depth = clamp(r.depth + dd / steps, MIN_D, MAX_D);

      r.bob = !r.bob;
      r.pose = r.bob ? "walk-a" : "walk-b";
      r.offsetY = r.bob ? -2 : 0;
      break;
    }
    case "idle": {
      if (--r.left <= 0) {
        if (Math.random() < TRICK_CHANCE) {
          const jumping = Math.random() < 0.5;
          r.phase = jumping ? "jump" : "spin";
          r.left = 4;
          r.frame = 0;
          r.pose = jumping ? "jump" : "spin";
        } else {
          startWalk(r);
        }
      }
      break;
    }
    case "jump": {
      r.offsetY = JUMP_FRAMES[r.frame] ?? 0;
      r.frame++;
      if (--r.left <= 0) {
        r.offsetY = 0;
        startWalk(r);
      }
      break;
    }
    case "spin": {
      r.rotation = (r.rotation + SPIN_STEP) % 360;
      if (--r.left <= 0) {
        r.rotation = 0;
        startWalk(r);
      }
      break;
    }
  }
}

const snapshot = (list: ResidentState[]): Resident[] =>
  list.map((r) => ({
    character: r.character,
    x: r.x,
    depth: r.depth,
    dir: r.dir,
    pose: r.pose,
    offsetY: r.offsetY,
    rotation: r.rotation,
  }));

/**
 * @param characters 居民名單
 * @param frozenId 這隻正在講話，站著不動
 */
export function useTownResidents(
  characters: Character[],
  frozenId: string | null,
): Resident[] {
  const prefersReduced = useReducedMotion();
  const stateRef = useRef<ResidentState[]>([]);
  const frozenRef = useRef(frozenId);
  frozenRef.current = frozenId;

  if (
    stateRef.current.length !== characters.length ||
    stateRef.current.some((r, i) => r.character.id !== characters[i]?.id)
  ) {
    stateRef.current = characters.map((c, i) => createResident(c, i, characters.length));
  }

  const [residents, setResidents] = useState<Resident[]>(() => snapshot(stateRef.current));

  useEffect(() => {
    // 要求減少動態時：居民站著不動，但仍散佈在不同深度，層次還在，也還是可以點
    if (prefersReduced) {
      stateRef.current.forEach((r) => {
        r.pose = "stand";
        r.offsetY = 0;
        r.rotation = 0;
      });
      setResidents(snapshot(stateRef.current));
      return;
    }

    const timer = window.setInterval(() => {
      for (const r of stateRef.current) {
        // 講話中的居民停下來聽你說話
        if (r.character.id === frozenRef.current) {
          r.pose = "stand";
          r.offsetY = 0;
          continue;
        }
        advance(r);
      }
      setResidents(snapshot(stateRef.current));
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [prefersReduced, characters]);

  return residents;
}
