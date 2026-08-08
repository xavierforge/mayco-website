import { motion } from "motion/react";
import { Sparkles } from "../components/Sparkles";
import { collabIntro, historyIntro, milestones } from "../data/history";
import { brand, contact } from "../data/site";

const collabChannels = [
  {
    label: "Email",
    value: contact.email,
    url: `mailto:${contact.email}`,
    emoji: "✉️",
    note: "合作提案、報價詢問都寄這裡",
  },
  {
    label: "Instagram",
    value: contact.instagram.handle,
    url: contact.instagram.url,
    emoji: "📷",
    note: "私訊也看得到，日常更新都在這",
  },
  {
    label: "LINE 官方帳號",
    value: contact.line.id,
    url: contact.line.url,
    emoji: "💬",
    note: "訂單與售後問題最快",
  },
];

export function History() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Sparkles count={24} seed={42} intensity={0.8} />
        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-10 text-center">
          <span className="text-5xl">{brand.sun}</span>
          <h1 className="title-pop mt-4 text-4xl font-black tracking-wide text-mayco sm:text-5xl">
            {historyIntro.title}
          </h1>
          <p className="mt-4 text-[15px] font-bold text-stone-500">{historyIntro.lead}</p>
          <p className="mt-2 text-xs text-stone-400">{historyIntro.note}</p>
        </div>
      </section>

      {/* 直式時間軸：垂直線 + 圓點 + 年份卡片 */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <ol className="relative ml-3 border-l-2 border-dashed border-stone-300/80 pl-6 sm:ml-6 sm:pl-10">
          {milestones.map((m) => (
            <motion.li
              key={`${m.year}-${m.title}`}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative pb-10 last:pb-0"
            >
              {/* 圓點 */}
              <span
                className={[
                  "absolute top-1 flex items-center justify-center rounded-full border-4 border-cream",
                  m.highlight
                    ? "-left-[38px] h-6 w-6 bg-mayco sm:-left-[54px]"
                    : "-left-[34px] h-4 w-4 bg-sun sm:-left-[50px]",
                ].join(" ")}
              />

              <div className="sticker p-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xl font-black text-mayco">{m.year}</span>
                  {m.when && (
                    <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-bold text-stone-500">
                      {m.when}
                    </span>
                  )}
                  <span className="ml-auto text-2xl leading-none">{m.emoji}</span>
                </div>
                <h2 className="mt-2 text-lg font-black text-stone-700">{m.title}</h2>
                <p className="mt-2 text-sm leading-7 text-stone-500">{m.desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* 合作洽詢 */}
      <section className="relative overflow-hidden border-t border-stone-200/70 bg-cream-deep/50">
        <Sparkles count={20} seed={11} intensity={0.7} />
        <div className="relative mx-auto max-w-3xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-black text-stone-700 sm:text-3xl">
              {collabIntro.title}
            </h2>
            <p className="mt-3 text-sm font-bold text-stone-500">{collabIntro.lead}</p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {collabChannels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="sticker flex h-full flex-col items-center gap-2 p-5 text-center transition-transform hover:-translate-y-1"
                >
                  <span className="text-3xl leading-none">{c.emoji}</span>
                  <span className="text-sm font-black text-stone-700">{c.label}</span>
                  <span className="text-sm font-bold break-all text-mayco">{c.value}</span>
                  <span className="mt-auto pt-2 text-xs text-stone-400">{c.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
