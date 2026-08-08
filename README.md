# 美可女子 Mayco 角色網站

插畫家「美可女子 Mayco」的品牌網站。首頁是可拖曳的物理樂園（Welcome to my zoo.），
另有三個內容分頁：美可的故事、品牌履歷、經典商品（美可雜貨店）。

## 開發

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
npm run lint
```

技術棧：Vite + React + TypeScript（strict）、Tailwind CSS v4、react-router-dom、motion、matter-js。

## 物理樂園

`src/hooks/usePhysics.ts` 是從專案根目錄 `demo.html` 移植過來的。
`demo.html` 是原始的 vanilla 參考實作，**請保留不要改動**：
裡面所有物理參數都是反覆實測調出來的手感值，
移植後兩邊在相同輸入下的模擬結果完全一致（逐幀比對誤差 0）。

改動 `usePhysics.ts` 的數值前請先確認你真的要換手感。

## 手繪逐格動畫（模擬 GIF 彩蛋）

在拿到真的 GIF 素材之前，首頁的三組彩蛋是用 CSS 模擬的：
兩側偶發探頭動物（`Critters.tsx`）、標題輪盤（`useTitleRoulette.ts`）、角落搖搖裝飾（`Shakers.tsx`）。

keyframes 都寫在 `src/index.css`，**一律用 `animation-timing-function: steps(1, end)`**，
每個 cycle 切 3~4 格、約 3~6fps。GIF 的味道來自低幀率逐格跳動，
**不要改成 `ease` / `linear`**，一改就變平滑補間，手繪感會整個消失。
（build 後在 CSS 裡會看到 `step-end`，那是 `steps(1, end)` 的等價寫法，正常。）

`prefers-reduced-motion: reduce` 時這三組會全部停用，探頭動物連生成都不會跑。

## 像素小鎮 `/pixel`（首頁的實驗版本）

首頁物理樂園的另一個版本，同一批角色改當 8-bit 小鎮居民。**首頁與其他頁不受影響。**

沒有像素美術素材，sprite 是 `src/lib/pixelate.ts` 現場產生的：
emoji／圖片／文字先畫到 24 格的小畫布，再用 `imageSmoothingEnabled = false` 放大 6 倍。
關掉平滑等於最近鄰插值，每格會被複製成一個大方塊，是真的馬賽克而不是模糊放大。
顯示時搭配 `image-rendering: pixelated`。

小鎮是 2.5D：居民在地面帶上有 x 與 depth 兩軸，往深處走會變小，
並且用 painter's algorithm（腳底線的 y 決定 z-index）跟房子、樹共用同一套排序，
所以會走到景物後面被擋住。走動是 5fps 的 `setInterval` 逐格推進。

## 待補的真實資料

目前站上的文字與商品都是示意內容，檔案內都有 `⚠️ 示意資料` 註解標明。
拿到創作者提供的內容後，只需要改 `src/data/` 底下的檔案：

| 檔案 | 待補內容 |
| --- | --- |
| `src/data/characters.ts` | 真實角色設定；把 `img` 填上去背 PNG 路徑（放 `public/characters/`），並依圖片調整 `aspect` 與 `scale`，emoji 佔位就會自動被取代 |
| `src/data/critters.ts` | 探頭動物小動畫（對應 critters 資料）；把 `img` 填上去背 PNG 或 GIF 路徑，emoji 佔位就會自動被取代 |
| `src/data/story.ts` | 真實的創作歷程 |
| `src/data/history.ts` | 真實的品牌大事紀與年份 |
| `src/data/products.ts` | 真實商品資料，以及 `shipping.ctaUrl`（實際的 7-11 賣貨便賣場連結，目前暫指向 portaly 總入口） |

`src/data/site.ts` 裡的聯絡資訊（email / Instagram / LINE / portaly）已是真實資料。
