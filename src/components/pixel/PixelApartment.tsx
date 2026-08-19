import { useCallback, useEffect, useState } from "react";
import { PixelSprite } from "./PixelSprite";
import { usePixelText } from "../../hooks/usePixelArt";
import { useTitleRoulette } from "../../hooks/useTitleRoulette";
import { useApartmentDoors, type DoorPhase } from "../../hooks/useApartmentDoors";
import { useCurrentTheme } from "../../hooks/useTheme";
import {
  apartmentClouds,
  apartmentFloors,
  apartmentIntro,
  apartmentUnits,
  streetProps,
  type ApartmentFloor,
  type ApartmentUnit,
} from "../../data/apartment";
import { brand } from "../../data/site";

/**
 * 美可公寓（首頁主場景）。
 *
 * 造型參考波士頓 brownstone 紅磚排屋：mansard 石板屋頂 + 煙囪、
 * 紅磚立面配石造窗楣的凸窗、黑鐵逃生梯、一樓中央的拱門石階大門。
 * 三層樓每層兩戶住著六隻動物，美可住最上面的閣樓 —— 她的門是屋頂上那扇老虎窗。
 *
 * 整棟樓的尺寸都以「格」為單位算，再乘上 displayScale（見 usePixelArt）換成 px，
 * 所以每一塊磚、每一扇門的邊界永遠落在實體像素上，縮放時不會出現半格毛邊。
 * 主標題（h1）浮在場景的天空裡，版權聲明刻在人行道上，首頁不再掛全站 Footer。
 *
 * 門的狀態機在 useApartmentDoors：住戶會自己隨機開門探頭，
 * 有人開門講話時鄰居只敢開一條門縫偷看；點門是敲門。
 */

/** 以下都是「格數」，乘上 displayScale 才是 px */
const PILLAR = 6;
/** 凸窗欄寬度 */
const BAY_W = 20;
const GAP = 4;
const DOOR_W = 20;
const DOOR_H = 22;
/** 閣樓老虎窗門：小一號 */
const ATTIC_DOOR_W = 18;
const ATTIC_DOOR_H = 20;
/** 門牌（掛在門的石楣上方） */
const PLAQUE_H = 4;
/** 樓層分隔帶：每層底部一條不同色的磚帶 */
const BELT_H = 2;
/** 1F 大廳層：只有公寓大門，不住人 */
const LOBBY_H = 26;
/** 窗欄實寬：窗台比窗寬 2 格 */
const WINDOW_COL_W = BAY_W + 2;
/** 門欄實寬：石楣比門寬 4 格 */
const DOOR_COL_W = DOOR_W + 4;
/**
 * 一戶的寬度 = 窗欄 + 間隔 + 門欄。
 * ⚠️ 一定要用「實寬」加總：窗台與石楣都比本體寬，漏算的話內容會溢出
 * 這一格容器、擠進中央柱，一樓大門就會跟住戶的門疊在一起。
 */
const UNIT_W = WINDOW_COL_W + GAP + DOOR_COL_W;
/** 中央柱：樓上掛逃生梯，一樓開公寓大門 */
const CENTER_W = 20;
const BUILDING_W = PILLAR + UNIT_W + CENTER_W + UNIT_W + PILLAR;
/**
 * 每層樓高。門（22）加石楣（2）加門牌（4）之後上面還留 1 格磚牆、
 * 腳下踩 3 格（分隔帶 2 格＋1 格磚，門不會直接踩在分隔帶上） —— 一層樓要有頭頂空間，看起來才真的是一層樓。
 */
const UNIT_H = 32;
/** 門與窗離樓地板多高 */
const FLOOR_PAD = 3;
/** mansard 閣樓層的高度 */
const ATTIC_H = 28;
/** 屋頂：壓頂石與兩階石板（由窄到寬），上面再冒一根煙囪 */
const COPING_H = 2;
const ROOF_STEP_H = 2;
const CHIMNEY_W = 6;
const CHIMNEY_H = 8;
/** 石造地基 */
const BASE_H = 4;
const STREET_H = 11;
/** 住戶 sprite 壓成幾格見方。比門洞窄，半開的時候才看得出是在門後探頭 */
const RESIDENT_BOX = 18;

/** 中央柱的左緣（格） */
const CENTER_LEFT = PILLAR + UNIT_W;

/** 場景物件的顯示倍率必須是整數，格子才會對齊實體像素 */
const scaleFor = (displayScale: number, factor: number) =>
  Math.max(2, Math.round(displayScale * factor));

/* --------------------------------------------------------------------------
 * 場景倍率：由內容需求反推，不寫死視窗門檻。
 *
 * 建築的總格數是上面那些常數的加總，對每個候選倍率算出
 * 「導覽列 + 標題區 + 整棟樓 + 人行道」需要的視窗大小，
 * 取塞得下的最大整數倍。這樣之後樓層加高、建築加寬，
 * 這裡完全不用跟著改 —— 需求變了，反推的結果自己就變了。
 * ------------------------------------------------------------------------ */

/** 住戶層數（跟著資料走） */
const FLOOR_COUNT = apartmentFloors.filter((floor) => floor.kind === "floor").length;
/** 屋頂（壓頂石＋兩階石板）＋整棟到人行道的總格數 */
const SCENE_GRID_H =
  COPING_H + 2 * ROOF_STEP_H + ATTIC_H + FLOOR_COUNT * UNIT_H + LOBBY_H + BASE_H + STREET_H;
/** 建築寬度加兩側最少的呼吸空間 */
const SCENE_GRID_W = BUILDING_W + 8;
/** 導覽列高度（Layout 的 min-h 也是用這個值算的） */
const NAV_H = 60;
/** 標題字級與 pixelateText 的畫布高公式（height = ceil(fontSize * 1.3)） */
const TITLE_FONT = 22;
const TITLE_SRC_H = Math.ceil(TITLE_FONT * 1.3);
/** 標題區裡標題圖以外的固定高度：slogan 行 + 上下內距 */
const HEADER_CHROME = 64;
const headerBudget = (titleScale: number) => TITLE_SRC_H * titleScale + HEADER_CHROME;

const MIN_SCALE = 2;
const MAX_SCALE = 6;
const MIN_TITLE_SCALE = 2;
const MAX_TITLE_SCALE = 4;

interface SceneLayout {
  scale: number;
  titleScale: number;
  /** 標題區上方的內距：把整數倍率吃不完的殘差墊在標題上面，標題就會貼近屋頂 */
  headerPad: number;
}

/**
 * 兩段式反推：
 * 1. 先給標題最小預算，讓公寓搶到塞得下的最大倍率（公寓是主角）；
 * 2. 剩下的高度再拿去放大標題 —— 整數倍率的殘差與其變成建築上方的
 *    一大片空白，不如讓標題吃掉。
 */
function sceneLayoutOf(): SceneLayout {
  if (typeof window === "undefined") return { scale: 3, titleScale: 3, headerPad: 12 };

  let scale = MIN_SCALE;
  for (let candidate = MAX_SCALE; candidate >= MIN_SCALE; candidate--) {
    const needH = NAV_H + headerBudget(MIN_TITLE_SCALE) + SCENE_GRID_H * candidate + 8;
    const needW = SCENE_GRID_W * candidate;
    if (window.innerHeight >= needH && window.innerWidth >= needW) {
      scale = candidate;
      break;
    }
  }

  const leftover = Math.max(
    0,
    window.innerHeight - (NAV_H + headerBudget(MIN_TITLE_SCALE) + SCENE_GRID_H * scale + 8),
  );
  const titleScale = Math.min(
    MAX_TITLE_SCALE,
    MIN_TITLE_SCALE + Math.floor(leftover / TITLE_SRC_H),
  );
  // 標題放大後還剩的殘差墊到標題上方：空曠留在導覽列下，標題貼近屋頂
  const headerPad = 12 + (leftover - (titleScale - MIN_TITLE_SCALE) * TITLE_SRC_H);

  return { scale, titleScale, headerPad };
}

/** 視窗改變就重推一次 */
function useSceneLayout(): SceneLayout {
  const [layout, setLayout] = useState(sceneLayoutOf);

  useEffect(() => {
    const onResize = () => setLayout(sceneLayoutOf());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return layout;
}

/**
 * 門開多少度。門板繞左側門軸「往室內」轉（正值 = 轉進屋裡），
 * 所以門板永遠在門洞範圍內，不會被 overflow 切掉。
 * 0 是關著、78 是幾乎全開（門板轉到快側面，只剩門軸邊一條）。
 */
const DOOR_ANGLE: Record<DoorPhase, number> = {
  closed: 0,
  knocking: 0,
  crack: 26,
  peek: 52,
  open: 78,
};

/**
 * 門板轉開之後，門洞右側會露出一條沒被遮住的縫；
 * 門板的投影寬度大約是 cos(角度)，所以縫從這裡開始（單位：格）。
 */
const gapStartOf = (angle: number, doorW: number) => doorW * Math.cos((angle * Math.PI) / 180);

/**
 * 住戶要站在那條縫裡才看得到。
 * 全開時站在縫的正中間（來開門的人），半開與門縫則貼著門邊，
 * 只露出身體的一小條 —— 這就是「偷看」與「站在門口」的差別。
 */
const residentCenterOf = (phase: DoorPhase, doorW: number) => {
  const gapStart = gapStartOf(DOOR_ANGLE[phase], doorW);
  if (phase === "open") return (gapStart + doorW) / 2;
  return Math.min(gapStart + 4, doorW - 2);
};

interface DoorProps {
  unit: ApartmentUnit;
  phase: DoorPhase;
  displayScale: number;
  /** 閣樓的老虎窗門：小一號、門板上半是玻璃 */
  attic?: boolean;
}

/** 一扇門：門洞、門後的住戶、往室內轉開的門板（門把跟著門板轉） */
function Door({ unit, phase, displayScale: s, attic = false }: DoorProps) {
  const { resident } = unit;
  const doorW = attic ? ATTIC_DOOR_W : DOOR_W;
  const doorH = attic ? ATTIC_DOOR_H : DOOR_H;
  const spriteBox = doorW - 4;
  const open = phase === "open";
  const peek = phase === "peek";
  const crack = phase === "crack";
  const visible = open || peek || crack;
  // 住戶站的位置由門開多少度算出來，門板的投影會蓋掉其餘部分
  const shift = (residentCenterOf(phase, doorW) - doorW / 2) * s;

  return (
    <div
      className={`relative ${phase === "knocking" ? "apt-knocking" : ""}`}
      style={{ width: doorW * s, height: doorH * s }}
    >
      <div
        className={`apt-doorway absolute inset-0 overflow-hidden ${open || peek ? "apt-doorway-lit" : ""}`}
      >
        {visible && (
          <div
            className="absolute bottom-0 left-1/2"
            style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
          >
            <span className={`block ${peek ? "apt-bob" : ""} ${crack ? "apt-spy" : ""}`}>
              <PixelSprite
                emoji={resident.emoji}
                img={resident.img}
                box={spriteBox}
                displayScale={s}
              />
            </span>
          </div>
        )}

        {/* 門板：往室內轉開，門洞的 perspective 讓它透視收窄。
            門把是門板的小孩，所以會跟著門一起轉進去，不會憑空消失再出現 */}
        <div
          className="apt-leaf absolute inset-0"
          style={{ transform: `rotateY(${DOOR_ANGLE[phase]}deg)` }}
        >
          {/* 閣樓的門板上半是玻璃：這是一扇老虎窗改的門，不是一般木門 */}
          {attic && (
            <div
              className="apt-glass apt-glass-lit absolute"
              style={{ left: 2 * s, right: 2 * s, top: 2 * s, height: 6 * s }}
            />
          )}
          <div
            className="apt-knob absolute"
            style={{ width: 3 * s, height: 3 * s, right: 3 * s, top: "46%" }}
          />
        </div>
      </div>

      {/* 敲門中：門上面跳出「叩叩叩」 */}
      {phase === "knocking" && (
        <span
          className="apt-knock-text absolute left-1/2 z-20 text-[11px] font-black text-stone-600"
          style={{ bottom: doorH * s + 2 }}
        >
          叩叩叩
        </span>
      )}
    </div>
  );
}

/** 門牌：只有編號（1F-1 這種），掛在門的石楣上方。住戶是誰，敲門才知道 */
function Plaque({ unit, s }: { unit: ApartmentUnit; s: number }) {
  return (
    <div
      className="apt-plaque flex items-center justify-center leading-none"
      style={{ minWidth: 10 * s, height: PLAQUE_H * s, padding: "0 4px" }}
    >
      <span className="text-[9px] font-black tracking-wider whitespace-nowrap text-stone-500">
        {unit.label}
      </span>
    </div>
  );
}

/** 凸窗：石楣 + 四格玻璃 + 突出的石窗台 */
function BayWindow({ s, blink }: { s: number; blink: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="apt-stone" style={{ width: BAY_W * s, height: 2 * s }} />
      <div
        className={`apt-glass apt-glass-lit ${blink ? "apt-window-blink" : ""}`}
        style={{ width: BAY_W * s, height: 14 * s }}
      />
      <div className="apt-stone" style={{ width: (BAY_W + 2) * s, height: 2 * s }} />
    </div>
  );
}

interface UnitColProps {
  unit: ApartmentUnit;
  phase: DoorPhase;
  /** 門牌欄在門的哪一邊：左戶靠左、右戶靠右，整層才對稱 */
  side: "left" | "right";
  displayScale: number;
  onKnock: (id: string) => void;
}

/** 一戶：凸窗欄（窗 + 門牌）與木門（石楣）並排 */
function UnitCol({ unit, phase, side, displayScale: s, onKnock }: UnitColProps) {
  const windowCol = (
    <div className="flex flex-col items-center gap-[2px]">
      <BayWindow s={s} blink={phase !== "closed"} />
      <div className="apt-fence" style={{ width: BAY_W * s, height: 4 * s }} />
    </div>
  );
  const doorCol = (
    <div className="flex flex-col items-center">
      <Plaque unit={unit} s={s} />
      <div className="apt-stone" style={{ width: (DOOR_W + 4) * s, height: 2 * s }} />
      <Door unit={unit} phase={phase} displayScale={s} />
    </div>
  );

  return (
    <div
      className="relative flex items-end"
      style={{ width: UNIT_W * s, paddingBottom: FLOOR_PAD * s, gap: GAP * s }}
    >
      {side === "left" ? windowCol : doorCol}
      {side === "left" ? doorCol : windowCol}

      {/* 整戶的點擊區疊在最上面：門、窗、門牌都算敲這一戶的門 */}
      <button
        type="button"
        onClick={() => onKnock(unit.id)}
        aria-expanded={phase === "open"}
        aria-label={`敲 ${unit.label} ${unit.resident.name} 的門`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-4 focus-visible:outline-mayco"
      />
    </div>
  );
}

interface FloorRowProps {
  floor: ApartmentFloor;
  phases: Record<string, DoorPhase>;
  displayScale: number;
  onKnock: (id: string) => void;
}

/** 住戶樓層：紅磚立面，左右各一戶，中間的中央柱是樓梯間（開一扇小窗） */
function FloorRow({ floor, phases, displayScale: s, onKnock }: FloorRowProps) {
  return (
    <div className="apt-brick relative flex items-end" style={{ height: UNIT_H * s }}>
      {/* 樓層分隔帶：一條不同色的磚，把每一層清楚隔開 */}
      <div
        aria-hidden
        className="apt-belt absolute inset-x-0 bottom-0"
        style={{ height: BELT_H * s }}
      />
      <div style={{ width: PILLAR * s }} />
      {floor.units.map((unit, index) => (
        <div key={unit.id} className="flex items-end">
          {/* 兩戶之間隔著中央柱（樓梯間），門才不會貼在一起 */}
          {index > 0 && <div style={{ width: CENTER_W * s }} />}
          <UnitCol
            unit={unit}
            phase={phases[unit.id] ?? "closed"}
            side={index === 0 ? "left" : "right"}
            displayScale={s}
            onKnock={onKnock}
          />
        </div>
      ))}

      {/* 中央柱：樓梯間的小窗 */}
      <div
        aria-hidden
        className="apt-glass apt-glass-lit absolute"
        style={{
          left: (CENTER_LEFT + 5) * s,
          width: (CENTER_W - 10) * s,
          height: 8 * s,
          bottom: (FLOOR_PAD + 11) * s,
        }}
      />

    </div>
  );
}

/** 閣樓：mansard 石板帶，中央老虎窗就是美可的門，兩側各兩扇小窗 */
function AtticRow({
  floor,
  phases,
  displayScale: s,
  onKnock,
}: Omit<FloorRowProps, "ground">) {
  const unit = floor.units[0];
  const phase = phases[unit.id] ?? "closed";
  return (
    <div className="apt-slate relative" style={{ height: ATTIC_H * s }}>
      {/* 老虎窗（dormer）：門牌 + 往上收的尖頂石帽 + 上半玻璃的小門 */}
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
        <Plaque unit={unit} s={s} />
        <div className="apt-stone" style={{ width: (ATTIC_DOOR_W - 4) * s, height: 2 * s }} />
        <div className="apt-stone" style={{ width: (ATTIC_DOOR_W + 2) * s, height: 2 * s }} />
        <div className="apt-stone flex justify-center" style={{ padding: `0 ${2 * s}px` }}>
          <Door unit={unit} phase={phase} displayScale={s} attic />
        </div>
      </div>

      {/* 兩側各兩扇小閣樓窗（一亮一暗） */}
      <div
        className="absolute flex gap-[6px]"
        style={{ right: PILLAR * s, bottom: (FLOOR_PAD + 4) * s }}
      >
        <div className="apt-glass apt-glass-lit" style={{ width: 7 * s, height: 7 * s }} />
        <div className="apt-glass" style={{ width: 7 * s, height: 7 * s }} />
      </div>

      <button
        type="button"
        onClick={() => onKnock(unit.id)}
        aria-expanded={phase === "open"}
        aria-label={`敲 ${unit.label} ${unit.resident.name} 的門`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-4 focus-visible:outline-mayco"
      />
    </div>
  );
}

/** 1F 大廳：中央是公寓的大門（雙開木門 + 氣窗），兩側各一扇大廳窗，不住人 */
function LobbyRow({ displayScale: s }: { displayScale: number }) {
  return (
    <div
      aria-hidden
      className="apt-brick relative flex items-end justify-center"
      style={{ height: LOBBY_H * s }}
    >
      <div className="apt-belt absolute inset-x-0 bottom-0" style={{ height: BELT_H * s }} />

      {/* 兩側的大廳窗 */}
      <div className="absolute" style={{ left: (PILLAR + 6) * s, bottom: FLOOR_PAD * s }}>
        <BayWindow s={s} blink={false} />
      </div>
      <div className="absolute" style={{ right: (PILLAR + 6) * s, bottom: FLOOR_PAD * s }}>
        <BayWindow s={s} blink={false} />
      </div>

      {/* 公寓大門：石拱 + 氣窗 + 雙開木門 */}
      <div className="flex flex-col items-center">
        <div className="apt-stone" style={{ width: (CENTER_W + 2) * s, height: 2 * s }} />
        <div
          className="apt-glass apt-glass-lit"
          style={{ width: (CENTER_W - 4) * s, height: 4 * s }}
        />
        <div
          className="apt-doorway relative overflow-hidden"
          style={{ width: (CENTER_W - 2) * s, height: 17 * s }}
        >
          <div className="apt-leaf absolute inset-y-0 left-0" style={{ width: "50%" }}>
            <div
              className="apt-knob absolute"
              style={{ width: 2 * s, height: 2 * s, right: 2, top: "46%" }}
            />
          </div>
          <div
            className="apt-leaf absolute inset-y-0 right-0"
            style={{ width: "50%", transform: "scaleX(-1)" }}
          >
            <div
              className="apt-knob absolute"
              style={{ width: 2 * s, height: 2 * s, right: 2, top: "46%" }}
            />
          </div>
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2"
            style={{ width: 2, backgroundColor: "var(--door-edge)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function PixelApartment() {
  const { scale: s, titleScale, headerPad } = useSceneLayout();
  const theme = useCurrentTheme();
  const title = usePixelText(apartmentIntro.title, { fontSize: TITLE_FONT });
  const titleVariant = useTitleRoulette();
  const { phases, openId, knock, close } = useApartmentDoors(apartmentUnits);
  const opened = apartmentUnits.find((unit) => unit.id === openId);
  const year = new Date().getFullYear();

  // 玩法說明掛在路燈上：點路燈才會亮出來，敲門就收掉（讓位給住戶介紹）
  const [helpOpen, setHelpOpen] = useState(false);
  const knockAndCloseHelp = useCallback(
    (id: string) => {
      setHelpOpen(false);
      knock(id);
    },
    [knock],
  );
  const toggleHelp = useCallback(() => {
    close();
    setHelpOpen((open) => !open);
  }, [close]);

  const floors = apartmentFloors.filter((floor) => floor.kind === "floor");
  const attic = apartmentFloors.find((floor) => floor.kind === "attic");

  return (
    <div className="pixel-sky relative flex w-full flex-1 flex-col overflow-hidden">
      {/* 天空：雲慢慢逐格飄，太陽晚上換成月亮 */}
      {apartmentClouds.map((cloud) => (
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
            emoji={theme === "dark" ? (cloud.nightEmoji ?? cloud.emoji) : cloud.emoji}
            box={cloud.box}
            displayScale={scaleFor(s, cloud.sizeFactor)}
          />
        </div>
      ))}

      {/* 主標題：浮在場景的天空裡，不屬於建築。外層掛逐格輪盤動畫 */}
      <header
        className="relative z-10 shrink-0 pb-1 text-center"
        style={{ paddingTop: headerPad }}
      >
        <p className="text-[11px] font-black tracking-[.3em] text-mayco-soft">
          {brand.sun} {brand.slogan.en}
        </p>
        <div className={`mt-1 origin-center ${titleVariant}`}>
          {title ? (
            <h1 className="flex justify-center">
              <img
                src={title.src}
                alt={apartmentIntro.title}
                className="pixelated block"
                style={{
                  width: title.sourceWidth * titleScale,
                  height: title.sourceHeight * titleScale,
                }}
              />
            </h1>
          ) : (
            // 沒有 canvas 可用時退回一般文字標題，版面不會塌掉
            <h1 className="text-4xl font-black tracking-widest text-mayco">
              {apartmentIntro.title}
            </h1>
          )}
        </div>
      </header>

      {/* 場景本體：佈告板改成浮動的（見下方），公寓就能真正置中 */}
      <div
        className="relative flex flex-1 items-end justify-center px-4"
        style={{ paddingBottom: STREET_H * s }}
      >
        {/* 建築本體 */}
        <div className="relative shrink-0" style={{ width: BUILDING_W * s }}>
          {/* 煙囪：紅磚身 + 石帽，冒在屋頂右肩上 */}
          <div
            aria-hidden
            className="absolute flex flex-col items-center"
            style={{
              left: (BUILDING_W - PILLAR - CHIMNEY_W - 8) * s,
              top: -(CHIMNEY_H - 4) * s,
            }}
          >
            <div className="apt-stone" style={{ width: (CHIMNEY_W + 2) * s, height: 2 * s }} />
            <div className="apt-brick" style={{ width: CHIMNEY_W * s, height: CHIMNEY_H * s }} />
          </div>

          {/* mansard 的階梯屋頂：由上而下越來越寬，最上面是壓頂石 */}
          <div
            className="apt-stone relative mx-auto"
            style={{ width: (BUILDING_W - 22) * s, height: COPING_H * s }}
          />
          <div
            className="apt-slate mx-auto"
            style={{ width: (BUILDING_W - 12) * s, height: ROOF_STEP_H * s }}
          />
          <div
            className="apt-slate mx-auto"
            style={{ width: (BUILDING_W - 4) * s, height: ROOF_STEP_H * s }}
          />

          {/* 閣樓（美可）＋三層住戶層（六隻動物）＋一樓大廳 */}
          {attic && <AtticRow floor={attic} phases={phases} displayScale={s} onKnock={knockAndCloseHelp} />}
          {floors.map((floor) => (
            <FloorRow
              key={floor.label}
              floor={floor}
              phases={phases}
              displayScale={s}
              onKnock={knockAndCloseHelp}
            />
          ))}

          {/* 1F 大廳：只有大門，住戶從 2F 開始住 */}
          <LobbyRow displayScale={s} />

          {/* 石造地基與大門前的石階 */}
          <div className="apt-stone relative" style={{ height: BASE_H * s }}>
            <div
              aria-hidden
              className="apt-stone absolute left-1/2 -translate-x-1/2"
              style={{ width: (CENTER_W + 4) * s, height: 2 * s, top: 0 }}
            />
            <div
              aria-hidden
              className="apt-stone absolute left-1/2 -translate-x-1/2"
              style={{ width: (CENTER_W + 8) * s, height: 2 * s, top: 2 * s }}
            />
          </div>

        </div>

        {/* 佈告板：平常不存在。敲開誰的門就介紹誰；點路燈才亮出玩法說明 */}
        {(opened || helpOpen) && (
        <div
          aria-live="polite"
          className="apt-pop pixel-panel absolute left-1/2 z-30 w-[min(92vw,360px)] -translate-x-1/2 p-5 lg:left-auto lg:right-[4%] lg:translate-x-0 lg:w-[320px]"
          style={{ bottom: STREET_H * s + 8 }}
        >
          {opened ? (
            <>
              <div className="flex items-center gap-3">
                <PixelSprite
                  emoji={opened.resident.emoji}
                  img={opened.resident.img}
                  box={RESIDENT_BOX}
                  displayScale={Math.max(2, s - 1)}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-black tracking-[.2em] text-stone-400">
                    {opened.label}
                  </p>
                  <h2 className="text-lg font-black leading-tight text-mayco">
                    {opened.resident.name}
                  </h2>
                  {opened.resident.caption && (
                    <p className="text-[11px] font-bold text-stone-400">
                      {opened.resident.caption}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-4 border-l-4 border-stone-700 bg-cream-deep px-3 py-2 text-[13px] font-bold leading-6 text-stone-600">
                「{opened.resident.knockLine}」
              </p>

              <p className="mt-3 text-[13px] leading-7 text-stone-600">{opened.resident.desc}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {opened.resident.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border-2 border-stone-700 bg-panel px-2 py-[2px] text-[11px] font-black text-stone-600"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={close}
                className="mt-4 w-full border-4 border-stone-700 bg-mayco py-2 text-xs font-black text-white shadow-[4px_4px_0_rgba(68,64,60,.25)]"
              >
                關上門
              </button>
            </>
          ) : (
            <>
              <h2 className="text-base font-black text-stone-700">兩戶一層，七扇門</h2>
              <p className="mt-3 text-[13px] leading-7 text-stone-600">{apartmentIntro.hint}</p>
              <ul className="mt-4 space-y-2 text-[12px] font-bold leading-6 text-stone-500">
                <li>· 門會自己開一下：那是住戶探頭看外面</li>
                <li>· 點任何一戶 = 敲那一戶的門，等他來開</li>
                <li>· 有人開門講話時，鄰居只敢開一條門縫偷看</li>
                <li>· 美可住在閣樓，她的門是屋頂上那扇老虎窗</li>
              </ul>
            </>
          )}
        </div>
        )}
      </div>

      {/* 人行道：版權聲明直接刻在道上，不另掛 Footer */}
      <div
        className="apt-street absolute inset-x-0 bottom-0 flex items-center justify-center"
        style={{ height: STREET_H * s }}
      >
        <p className="relative z-10 px-4 text-center text-[10px] font-bold text-stone-500">
          © {year} {brand.name.zh} {brand.name.en} · 插畫與角色版權皆為創作者所有
        </p>
      </div>

      {/* 街燈：點一下亮出玩法說明，再點一下收起來 */}
      <button
        type="button"
        onClick={toggleHelp}
        aria-expanded={helpOpen}
        aria-label="玩法說明"
        title="玩法說明"
        className="absolute z-20 flex cursor-pointer flex-col items-center right-3 sm:right-auto sm:left-[73%] focus-visible:outline-4 focus-visible:outline-mayco"
        style={{ bottom: (STREET_H - 2) * s }}
      >
        {/* 「?」提示：說明牌還沒開過的時候逐格跳動，招呼人來點 */}
        {!helpOpen && (
          <span
            aria-hidden
            className="apt-hint mb-1 text-[13px] font-black text-mayco"
          >
            ?
          </span>
        )}
        <div
          className={`apt-lamp-head ${helpOpen ? "" : "apt-lamp-wink"}`}
          style={{
            width: 6 * s,
            height: 6 * s,
            filter: helpOpen ? "brightness(1.2)" : undefined,
          }}
        />
        <div className="apt-lamp-post" style={{ width: 2 * s, height: 22 * s }} />
      </button>

      {/* 街景裝飾：純裝飾不吃點擊。窄視窗藏起來，免得擋住公寓 */}
      {streetProps.map((prop) => (
        <div
          key={`${prop.emoji}-${prop.left}`}
          aria-hidden
          className="pointer-events-none absolute hidden -translate-x-1/2 sm:block"
          style={{ left: `${prop.left}%`, bottom: (STREET_H - 4) * s }}
        >
          <PixelSprite
            emoji={prop.emoji}
            box={prop.box}
            displayScale={scaleFor(s, prop.sizeFactor)}
          />
        </div>
      ))}
    </div>
  );
}
