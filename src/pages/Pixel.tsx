import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { PixelTown } from "../components/pixel/PixelTown";
import { useDisplayScale, usePixelText } from "../hooks/usePixelArt";
import { characters } from "../data/characters";
import { townIntro } from "../data/pixelTown";
import { brand } from "../data/site";

/**
 * 像素小鎮 —— 首頁的實驗版本。
 * 同一批動物角色，換成 8-bit 的小鎮居民。原本的物理樂園首頁不受影響。
 */
export function Pixel() {
  const displayScale = useDisplayScale();
  const title = usePixelText(townIntro.title, { fontSize: 22 });

  return (
    <>
      {/* 第一屏：扣掉導覽列高度後撐滿一個螢幕，標題固定、場景吃掉多餘空間。
          極矮視窗（如橫向手機）內容會超出 min-height，交給頁面正常捲動，不硬壓地面帶 */}
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <section className="mx-auto w-full max-w-5xl shrink-0 px-6 pt-14 pb-8 text-center">
          <p className="inline-block border-2 border-stone-300 bg-white px-3 py-1 text-[11px] font-black tracking-widest text-stone-500">
            EXPERIMENT · 首頁的另一個版本
          </p>

          {title ? (
            <h1 className="mt-5 flex justify-center">
              <img
                src={title.src}
                alt={townIntro.title}
                className="pixelated block"
                style={{
                  width: title.sourceWidth * displayScale,
                  height: title.sourceHeight * displayScale,
                }}
              />
            </h1>
          ) : (
            // 沒有 canvas 可用時退回一般文字標題，版面不會塌掉
            <h1 className="mt-5 text-4xl font-black tracking-widest text-mayco">
              {townIntro.title}
            </h1>
          )}

          <p className="mt-4 text-[15px] font-bold text-stone-500">{townIntro.lead}</p>
        </section>

        {/* 小鎮場景：全寬，flex-1 把第一屏剩下的高度都吃掉（天空帶跟著長高，地面帶維持固定） */}
        <section className="flex flex-1 border-y-4 border-stone-700">
          <PixelTown characters={characters} />
        </section>
      </div>

      {/* 說明：落在第一屏摺線以下，捲進來時淡入 */}
      <section className="mx-auto max-w-3xl px-6 pt-8 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pixel-panel p-6"
        >
          <h2 className="text-lg font-black text-stone-700">關於這個版本</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">{townIntro.note}</p>
          <p className="mt-2 text-sm leading-7 text-stone-500">
            小鎮裡的居民就是首頁那六隻動物，只是被壓成 24 格見方再放大成像素小人。
            他們會在鎮上四處走動，往深處走的時候會變小、也會被房子和樹擋住，
            偶爾停下來發呆、跳一下或原地轉圈 {brand.kaomoji}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="border-4 border-stone-700 bg-mayco px-5 py-2 text-sm font-black text-white shadow-[4px_4px_0_rgba(68,64,60,.25)]"
            >
              回去看物理樂園版
            </Link>
            <Link
              to="/story"
              className="border-4 border-stone-700 bg-white px-5 py-2 text-sm font-black text-stone-700 shadow-[4px_4px_0_rgba(68,64,60,.25)]"
            >
              認識這些動物
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
