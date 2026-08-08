import { Link } from "react-router-dom";
import { Sparkles } from "../components/Sparkles";
import { brand } from "../data/site";

export function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <Sparkles count={24} seed={42} intensity={0.8} />
      <div className="relative mx-auto max-w-xl px-6 py-28 text-center">
        <span className="text-6xl">🐾</span>
        <h1 className="title-pop mt-6 text-4xl font-black text-mayco">走丟了 (´•ω•`)</h1>
        <p className="mt-4 text-[15px] leading-8 text-stone-500">
          這裡沒有動物耶，可能是他們自己跑掉了。
          <br />
          回到動物園門口再試一次吧 {brand.sun}
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-mayco px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          回首頁
        </Link>
      </div>
    </section>
  );
}
