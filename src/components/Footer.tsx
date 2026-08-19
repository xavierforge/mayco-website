import { brand } from "../data/site";

/** 只留版權聲明。聯絡資訊在 portaly，不再重複放在站上 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/70 bg-cream-deep/60">
      <p className="mx-auto max-w-5xl px-6 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {brand.name.zh} {brand.name.en} ·
        插畫與角色版權皆為創作者所有
      </p>
    </footer>
  );
}
