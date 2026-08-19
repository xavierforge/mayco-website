import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { ApartmentUnit } from "../data/apartment";

/**
 * 公寓每扇門的狀態機。
 *
 * 一扇門有五個狀態：
 *   closed   關著
 *   crack    只開一條門縫偷看（有人正在跟美可講話時，鄰居的反應）
 *   peek     開半扇門探頭出來看（沒有人開門時的環境動態）
 *   knocking 被敲門中（門在抖）
 *   open     住戶來開門了，個性說明會顯示出來
 *
 * 同一時間只會有一扇門是 open：敲第二扇門時第一扇會自己關上，
 * 所以說明面板永遠只對應一位住戶，不需要在畫面上排隊。
 *
 * 「有人開門時其他人只敢開門縫」這件事是狀態機決定的，不是畫面決定的：
 * 隨機開門時會看當下有沒有人 open，有的話就發 crack 而不是 peek，
 * 而且有人開門後會馬上安排一位鄰居偷看，看起來像被講話聲吸引過來。
 *
 * 隨機開門刻意用 setTimeout 串接而不是固定 interval，間隔本身是亂數，
 * 看起來才像住戶各自有事在忙，而不是排班表。
 *
 * `awayId` 是正在外面散步的住戶：不會自己探頭，敲門也只會抖一抖沒人應。
 */

export type DoorPhase = "closed" | "crack" | "peek" | "knocking" | "open";

/** 第一次隨機開門的延遲：讓使用者先看清楚整棟樓 */
const FIRST_DELAY = 1600;
/** 之後每次隨機開門的間隔：2200 ~ 5200ms */
const GAP_MIN = 2200;
const GAP_RANDOM = 3000;
/** 探頭停留多久 */
const PEEK_MS = 2200;
/** 偷看停留多久。比探頭短，偷看完就縮回去 */
const CRACK_MS = 1700;
/** 有人開門後多久，鄰居會被吸引過來偷看 */
const CURIOUS_DELAY = 520;
/** 敲門到開門之間的等待（門抖的時間，與 .apt-knocking 的 CSS 動畫對齊） */
const KNOCK_MS = 640;

/** 會自己關上的兩個狀態 */
type BriefPhase = "peek" | "crack";

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

export interface ApartmentDoors {
  phases: Record<string, DoorPhase>;
  /** 目前開著的那扇門；沒有人開門時是 null */
  openId: string | null;
  /** 敲門。敲已經開著的那扇門等於關門 */
  knock: (id: string) => void;
  close: () => void;
}

const allClosed = (units: ApartmentUnit[]): Record<string, DoorPhase> =>
  Object.fromEntries(units.map((unit) => [unit.id, "closed" as DoorPhase]));

export function useApartmentDoors(
  units: ApartmentUnit[],
  awayId: string | null = null,
): ApartmentDoors {
  const prefersReduced = useReducedMotion();
  const [phases, setPhases] = useState<Record<string, DoorPhase>>(() => allClosed(units));
  const [openId, setOpenId] = useState<string | null>(null);

  // 排程跑在 timer 裡，需要讀當下的狀態又不想重排 effect，所以鏡一份到 ref
  const phasesRef = useRef(phases);
  phasesRef.current = phases;
  const openIdRef = useRef(openId);
  openIdRef.current = openId;
  const awayIdRef = useRef(awayId);
  awayIdRef.current = awayId;

  const knockTimerRef = useRef(0);
  const curiousTimerRef = useRef(0);
  /** 每扇門各自的「時間到就關上」計時器 */
  const briefTimersRef = useRef(new Map<string, number>());

  /** 開一下就自己關上（探頭或偷看） */
  const openBriefly = useCallback((id: string, phase: BriefPhase, ms: number) => {
    const timers = briefTimersRef.current;
    clearTimeout(timers.get(id));
    setPhases((current) => ({ ...current, [id]: phase }));
    timers.set(
      id,
      window.setTimeout(() => {
        timers.delete(id);
        // 這段期間如果被敲門了就別多手把人家的門關掉
        setPhases((current) => (current[id] === phase ? { ...current, [id]: "closed" } : current));
      }, ms),
    );
  }, []);

  /** 挑一位「不是正在開門的那位」的鄰居 */
  const idleNeighbours = useCallback(
    (exceptId: string | null) =>
      units
        .map((unit) => unit.id)
        .filter(
          (id) =>
            id !== exceptId &&
            id !== openIdRef.current &&
            id !== awayIdRef.current &&
            phasesRef.current[id] === "closed",
        ),
    [units],
  );

  const close = useCallback(() => {
    clearTimeout(knockTimerRef.current);
    clearTimeout(curiousTimerRef.current);
    const current = openIdRef.current;
    setOpenId(null);
    if (!current) return;
    setPhases((phase) => ({ ...phase, [current]: "closed" }));
  }, []);

  const knock = useCallback(
    (id: string) => {
      clearTimeout(knockTimerRef.current);
      clearTimeout(curiousTimerRef.current);
      clearTimeout(briefTimersRef.current.get(id));
      briefTimersRef.current.delete(id);

      // 敲已經開著的那扇門 = 把門關上
      if (openIdRef.current === id) {
        setOpenId(null);
        setPhases((phase) => ({ ...phase, [id]: "closed" }));
        return;
      }

      // 人在外面散步：門抖一抖，多等一拍，還是沒人來開
      if (awayIdRef.current === id) {
        setPhases((phase) => ({ ...phase, [id]: "knocking" }));
        knockTimerRef.current = window.setTimeout(() => {
          setPhases((phase) => ({ ...phase, [id]: "closed" }));
        }, KNOCK_MS + 900);
        return;
      }

      const previous = openIdRef.current;
      setOpenId(null);
      setPhases((phase) => {
        const next = { ...phase };
        if (previous) next[previous] = "closed";
        next[id] = "knocking";
        return next;
      });

      // 減少動態時不演敲門，直接開
      const wait = prefersReduced ? 0 : KNOCK_MS;
      knockTimerRef.current = window.setTimeout(() => {
        setPhases((phase) => ({ ...phase, [id]: "open" }));
        setOpenId(id);

        // 有人開門講話了，隔壁馬上偷看一下
        if (prefersReduced) return;
        curiousTimerRef.current = window.setTimeout(() => {
          const others = idleNeighbours(id);
          if (others.length > 0) openBriefly(pick(others), "crack", CRACK_MS);
        }, CURIOUS_DELAY);
      }, wait);
    },
    [prefersReduced, idleNeighbours, openBriefly],
  );

  // 門的名單變了（角色資料改動）就整棟重置，免得留下不存在的門
  useEffect(() => {
    clearTimeout(knockTimerRef.current);
    clearTimeout(curiousTimerRef.current);
    setPhases(allClosed(units));
    setOpenId(null);
  }, [units]);

  // 環境動態：隨機挑一扇關著的門開一下再關上。
  // 有人正在開門講話時，其他人只敢開一條門縫偷看
  useEffect(() => {
    if (prefersReduced) return;

    let alive = true;
    let gapTimer = 0;

    const run = () => {
      if (!alive) return;

      const candidates = idleNeighbours(null);
      if (candidates.length > 0) {
        const someoneOpen = openIdRef.current !== null;
        openBriefly(
          pick(candidates),
          someoneOpen ? "crack" : "peek",
          someoneOpen ? CRACK_MS : PEEK_MS,
        );
      }

      gapTimer = window.setTimeout(run, GAP_MIN + Math.random() * GAP_RANDOM);
    };

    gapTimer = window.setTimeout(run, FIRST_DELAY);

    return () => {
      alive = false;
      clearTimeout(gapTimer);
    };
  }, [prefersReduced, idleNeighbours, openBriefly]);

  // 卸載時把所有計時器收掉
  useEffect(() => {
    const timers = briefTimersRef.current;
    return () => {
      clearTimeout(knockTimerRef.current);
      clearTimeout(curiousTimerRef.current);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { phases, openId, knock, close };
}
