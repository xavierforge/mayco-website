import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Playground } from "../components/Playground";
import { CharacterModal } from "../components/CharacterModal";
import { Sparkles } from "../components/Sparkles";
import { Shakers } from "../components/Shakers";
import { Critters } from "../components/Critters";
import { useTitleRoulette } from "../hooks/useTitleRoulette";
import { characters, type Character } from "../data/characters";
import { critters } from "../data/critters";
import { brand } from "../data/site";

export function Home() {
  const [selected, setSelected] = useState<Character | null>(null);
  const handleSelect = useCallback((c: Character) => setSelected(c), []);
  const handleClose = useCallback(() => setSelected(null), []);
  const titleVariant = useTitleRoulette();

  return (
    <>
      {/* 物理樂園：扣掉導覽列高度後撐滿一個螢幕 */}
      <section className="relative overflow-hidden">
        <Sparkles count={36} seed={42} />
        <Shakers />
        <Playground
          characters={characters}
          onSelect={handleSelect}
          className="h-[calc(100dvh-60px)] min-h-[520px] w-full"
        >
          {({ scatter }) => (
            <div
              onClick={scatter}
              className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer text-center select-none"
            >
              <p className="text-sm font-bold tracking-[.3em] text-mayco-soft">
                {brand.sun} {brand.slogan.en}
              </p>
              {/* 逐格輪盤動畫掛在外層 span，內層才是文字：
                  transform 動在區塊上，字本身不會被拆開重排 */}
              <div className={`mt-2 origin-center ${titleVariant}`}>
                <h1 className="title-pop text-[clamp(44px,9vw,96px)] leading-none font-black tracking-[.08em] text-mayco">
                  {brand.name.zh}
                </h1>
              </div>
              <p className="mt-4 text-base font-bold text-stone-500 sm:text-lg">
                {brand.intro.zh}，{brand.tagline.zh} {brand.kaomoji}
              </p>
              <p className="mt-3 text-xs font-bold text-stone-400 sm:text-sm">
                拖曳動物甩出去試試 · 點一下認識他 · 點標題讓大家跳起來
              </p>
            </div>
          )}
        </Playground>

        {/* 偶發探頭動物：疊在樂園上面，但不吃滑鼠事件，不影響拖曳 */}
        <Critters animals={critters} />
      </section>

      {/* 樂園下面接一小段自我介紹，順便把人帶到其他頁 */}
      <section className="relative overflow-hidden border-t border-stone-200/70 bg-cream-deep/50">
        <Sparkles count={18} seed={7} intensity={0.7} />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-5xl">{brand.sun}</span>
            <h2 className="mt-4 text-2xl font-black text-stone-700 sm:text-3xl">
              歡迎來到我的動物園
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-stone-500">
              我是美可，一個到處撿到動物的女畫仔。路邊的、夢裡的、朋友嘴裡講到的，
              通通被我撿進畫本，變成這裡的住戶。你可以隨便拖著他們玩，他們不會生氣的。
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/story"
                className="rounded-full bg-mayco px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                看看美可的故事
              </Link>
              <Link
                to="/shop"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-stone-600 shadow-sm transition-transform hover:-translate-y-0.5 hover:text-mayco"
              >
                逛逛美可雜貨店
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <CharacterModal character={selected} onClose={handleClose} />
    </>
  );
}
