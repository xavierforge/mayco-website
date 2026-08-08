import { NavLink } from "react-router-dom";
import { brand, navItems } from "../data/site";

/**
 * 頂部導覽。手機上縮成一排可橫向捲動的膠囊按鈕，桌機展開成一般選單。
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-2 text-mayco transition-transform hover:-rotate-2"
        >
          <span aria-hidden className="text-xl sm:text-2xl">
            {brand.sun}
          </span>
          <span className="text-base font-black tracking-wide sm:text-lg">
            {brand.name.zh}
          </span>
          <span className="hidden text-xs font-bold text-stone-400 sm:inline">
            {brand.name.en}
          </span>
        </NavLink>

        <ul className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] sm:justify-end sm:gap-2 [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <li key={item.to} className="shrink-0">
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "block rounded-full px-3 py-1.5 text-sm font-bold transition-colors sm:text-[15px]",
                    isActive
                      ? "bg-mayco text-white shadow-sm"
                      : "text-stone-500 hover:bg-white hover:text-mayco",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
