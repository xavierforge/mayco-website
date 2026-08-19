import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { useTheme } from "../hooks/useTheme";

/** 換頁時回到最上面，不然從長頁跳過去會停在半空中 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function Layout() {
  // 主題只在這裡取一份，往下傳給導覽列的切換鈕，避免兩份狀態各說各話
  const { theme, mode, cycle } = useTheme();
  // 首頁是單屏場景，版權聲明刻在場景的人行道上，不再掛全站 Footer
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <ScrollToTop />
      <Nav theme={theme} mode={mode} onCycleTheme={cycle} />
      {/* flex 容器：首頁需要「剛好一屏、不用捲」，靠 flex-1 吃掉導覽列與 footer 之外的高度 */}
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      {pathname !== "/" && <Footer />}
    </div>
  );
}
