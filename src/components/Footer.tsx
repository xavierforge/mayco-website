import { brand, socialLinks } from "../data/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/70 bg-cream-deep/60">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <p className="text-2xl font-black text-mayco">
              {brand.sun} {brand.name.zh} {brand.name.en}
            </p>
            <p className="mt-2 text-sm font-bold text-stone-500">{brand.intro.zh}</p>
            <p className="mt-1 text-sm text-stone-400">
              {brand.tagline.zh} {brand.kaomoji}
            </p>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-2">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow-sm transition-transform hover:-translate-y-0.5 hover:text-mayco"
                >
                  <span aria-hidden>{link.emoji}</span>
                  <span>{link.value}</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} {brand.name.zh} {brand.name.en} ·
            插畫與角色版權皆為創作者所有
          </p>
        </div>
      </div>
    </footer>
  );
}
