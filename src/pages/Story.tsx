import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "../components/Sparkles";
import { CharacterGrid } from "../components/CharacterGrid";
import { CharacterModal } from "../components/CharacterModal";
import { characters, type Character } from "../data/characters";
import { familyIntro, storyIntro, storySections } from "../data/story";
import { brand } from "../data/site";

export function Story() {
  const [selected, setSelected] = useState<Character | null>(null);
  const handleSelect = useCallback((c: Character) => setSelected(c), []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      {/* 頁首 */}
      <section className="relative overflow-hidden">
        <Sparkles count={24} seed={42} intensity={0.8} />
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <span className="text-5xl">{brand.sun}</span>
          <h1 className="title-pop mt-4 text-4xl font-black tracking-wide text-mayco sm:text-5xl">
            {storyIntro.title}
          </h1>
          <p className="mt-4 text-[15px] font-bold text-stone-500">{storyIntro.lead}</p>
        </div>
      </section>

      {/* 說書式長頁：一段一段捲進來 */}
      <div className="mx-auto max-w-3xl px-6 pb-12">
        {storySections.map((section, i) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="py-12"
          >
            {/* 場景大 emoji（之後可換成插畫） */}
            <div
              className={[
                "flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10",
                i % 2 === 1 ? "sm:flex-row-reverse" : "",
              ].join(" ")}
            >
              <div className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_-14px_rgba(120,80,40,.55)] sm:h-36 sm:w-36">
                  <span className="text-5xl leading-none sm:text-6xl">{section.scene}</span>
                </div>
                {section.caption && (
                  <p className="max-w-36 text-center text-[11px] leading-4 text-stone-400">
                    {section.caption}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-black tracking-[.25em] text-mayco-soft">
                  {section.chapter}
                </p>
                <h2 className="mt-1 text-2xl font-black text-stone-700 sm:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((p, pi) => (
                    <p key={pi} className="text-[15px] leading-8 text-stone-600">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      {/* 結尾：角色家族介紹格 */}
      <section className="relative overflow-hidden border-t border-stone-200/70 bg-cream-deep/50">
        <Sparkles count={20} seed={99} intensity={0.7} />
        <div className="relative mx-auto max-w-3xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-black text-stone-700 sm:text-3xl">
              {familyIntro.title}
            </h2>
            <p className="mt-3 text-sm font-bold text-stone-500">{familyIntro.lead}</p>
          </div>
          <div className="mt-10">
            <CharacterGrid characters={characters} onSelect={handleSelect} />
          </div>
        </div>
      </section>

      <CharacterModal character={selected} onClose={handleClose} />
    </>
  );
}
