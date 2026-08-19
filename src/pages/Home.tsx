import { PixelApartment } from "../components/pixel/PixelApartment";

/**
 * 首頁 —— 美可公寓。
 *
 * 整頁就是一個場景、剛好一屏、不用往下捲：標題是屋頂招牌、
 * 版權聲明刻在人行道上，全都在 PixelApartment 裡。
 * 首頁不掛全站 Footer（見 Layout）。
 */
export function Home() {
  return <PixelApartment />;
}
