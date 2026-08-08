import { motion } from "motion/react";
import { Sparkles } from "../components/Sparkles";
import { products, shipping, shopIntro } from "../data/products";
import { brand } from "../data/site";

export function Shop() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Sparkles count={24} seed={42} intensity={0.8} />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-10 text-center">
          <span className="text-5xl">{brand.sun}</span>
          <h1 className="title-pop mt-4 text-4xl font-black tracking-wide text-mayco sm:text-5xl">
            {shopIntro.title}
          </h1>
          <p className="mt-4 text-[15px] font-bold text-stone-500">{shopIntro.lead}</p>
        </div>
      </section>

      {/* 購買說明：7-11 賣貨便 */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="sticker flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-lg font-black text-stone-700">
              <span aria-hidden>🏪</span>
              {shipping.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {shipping.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2 text-sm leading-7 text-stone-500"
                >
                  <span aria-hidden className="text-mayco-soft">
                    ·
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="shrink-0 text-center">
            <a
              href={shipping.ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-mayco px-8 py-4 text-base font-black text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {shipping.ctaLabel}
            </a>
            <p className="mt-2 max-w-56 text-[11px] leading-4 text-stone-400">
              {shipping.ctaNote}
            </p>
          </div>
        </div>
      </section>

      {/* 商品格 */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product, i) => {
            const soldOut = product.status === "sold-out";
            return (
              <motion.li
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.06, ease: "easeOut" }}
                className="sticker group flex flex-col overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.02]"
              >
                {/* 商品圖佔位；之後把 product.img 填上就會換成實拍圖 */}
                <div className="relative flex aspect-square items-center justify-center bg-cream">
                  {product.img ? (
                    <img
                      src={product.img}
                      alt={product.name}
                      className={[
                        "h-full w-full object-cover",
                        soldOut ? "opacity-60 grayscale" : "",
                      ].join(" ")}
                    />
                  ) : (
                    <span
                      className={[
                        "text-5xl leading-none transition-transform duration-200 group-hover:scale-110 sm:text-6xl",
                        soldOut ? "opacity-50 grayscale" : "",
                      ].join(" ")}
                    >
                      {product.emoji}
                    </span>
                  )}

                  <span
                    className={[
                      "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-black",
                      soldOut ? "bg-stone-400 text-white" : "bg-sun text-stone-800",
                    ].join(" ")}
                  >
                    {soldOut ? "售罄" : "現貨"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[11px] font-bold text-stone-400">
                    {product.category}
                  </span>
                  <h3 className="mt-1 text-sm font-black text-stone-700 sm:text-base">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-6 text-stone-500">
                    {product.desc}
                  </p>
                  <p className="mt-3 text-lg font-black text-mayco">
                    NT$ {product.price}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-xs text-stone-400">
          以上為示意商品資料（品名、價格、庫存狀態皆待創作者提供實際內容後替換） {brand.kaomoji}
        </p>
      </section>
    </>
  );
}
