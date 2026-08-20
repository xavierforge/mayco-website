# 美可女子 Mayco 角色網站

插畫家「美可女子 Mayco」的品牌網站。首頁是 8-bit 的「美可公寓」（Welcome to my zoo.）：
六扇門、六位住戶，住戶會自己隨機開門探頭，點門等於敲門，開門後顯示那位的個性說明。
另有三個內容分頁：美可的故事、品牌履歷、經典商品（美可雜貨店）。
全站有亮／暗兩套主題，預設跟著使用者當地時間走。
品牌調性參考創作者的 portaly（https://portaly.cc/mayco）。

## 開發

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
npm run lint
```

技術棧：Vite + React + TypeScript（strict）、Tailwind CSS v4、react-router-dom、motion。
（物理樂園移除後 matter-js 已從 dependencies 拿掉；`demo.html` 是獨立的參考檔，走 CDN 不吃 node_modules。）

## 部署

- 線上網址：https://mayco-studio.github.io/mayco-website/
- repo：https://github.com/mayco-studio/mayco-website
- 部署方式：push 到 main 即由 GitHub Actions（`.github/workflows/deploy.yml`）自動建置部署，約一兩分鐘生效
- base path 機制：CI 帶 `GITHUB_PAGES=true` 時 vite base 為 `/mayco-website/`，本機開發不帶時為 `/`；BrowserRouter 的 basename 吃 `import.meta.env.BASE_URL` 所以兩邊通用
- SPA fallback：workflow 會把 `index.html` 複製成 `404.html`，深層路由（`/story`、`/shop` 等）直開時 HTTP 狀態碼是 404 但內容正常，是 GitHub Pages 的已知行為
- 免費方案限制：Pages 需 public repo；就算付費轉私有，發佈的網站仍是公開的（真正鎖站需 Enterprise 或改用 Cloudflare Pages + Access）

## 美可公寓（首頁）

首頁是單一場景、剛好一屏不用捲：主標題浮在天空、版權聲明刻在人行道上（首頁不掛全站 Footer，見 `Layout.tsx`）。
造型參考波士頓 brownstone 紅磚排屋：mansard 石板屋頂＋煙囪、石造窗楣的凸窗、一樓中央的公寓大門與石階。
三層樓每層兩戶住著六隻動物，美可住最上面的閣樓 —— 她的門是屋頂上那扇老虎窗（小一號、門板上半是玻璃）。

- `src/data/apartment.ts` — 樓層與門牌。住戶文案的唯一來源仍然是 `characters.ts`，
  這裡只補門牌、個性標籤與敲門的第一句話；角色被改名或移除時，
  對應那一戶會被自動跳過而不是讓首頁爆掉。哪一戶住誰改 `characterId`
- `src/hooks/useApartmentDoors.ts` — 門的狀態機（`closed` / `crack` / `peek` / `knocking` / `open`）。
  「隨機開門」是 setTimeout 串接、間隔是亂數；同一時間只有一扇門 `open`。
  **有人開門講話時，其他人的隨機開門會自動降級成 `crack`（只開一條門縫偷看）**，
  而且有人開門後會馬上安排一位鄰居偷看，像被講話聲吸引過來
- `src/components/pixel/PixelApartment.tsx` — 建築本體。**所有尺寸都以「格」為單位寫，
  再乘上整數倍率換成 px**，磚與門的邊界才會落在實體像素上。改尺寸請改格數常數，不要直接寫 px。
  倍率不是寫死的視窗門檻：`useSceneScale` 對每個候選倍率算出「導覽列＋標題＋整棟樓＋人行道」
  需要的視窗大小，取塞得下的最大整數倍（2~6），樓層加高或建築加寬時它自己會跟著變
- 磚、瓦、玻璃、鐵件都是 `index.css` 裡 hard stop 的 repeating／conic gradient（`.apt-*`），
  只有住戶 sprite 與像素標題是 canvas 現場產生的（`src/lib/pixelate.ts`）
- 門是**繞左側門軸往室內轉開**的旋轉門：門洞掛 `perspective`，門板 `rotateY`。
  ⚠️ 不要改回 `scaleX`，橫向縮放看起來是拉門／捲門。轉的過程是 `steps(3, end)`，**不要換成 ease**
- 門把是**門板的小孩**，跟著門一起轉進去，不會憑空消失再出現
- 住戶站的位置從門的角度算出來（`residentCenterOf`）：門板投影寬約 `cos(角度)`，
  剩下那條縫才看得到人 —— 全開、探頭、門縫偷看三種樣子共用同一套幾何
- `prefers-reduced-motion: reduce` 時不再隨機開門、不演敲門動畫，點門直接開；
  自動大門、屋頂青蛙、散步全部停用
- 角色是創作者的真實貼紙素材（`assets-stickers/`，不進版控；去背處理後放
  `public/characters/`）。門裡與介紹卡都用原圖直接縮放，只有 emoji 佔位才像素化
- 2F-2 是共用服裝間：門一有動靜就從芭樂頭套系列（`public/characters/costumes/`）隨機抽一張
- 環境彩蛋：住戶會被隨機抽去散步（`public/characters/walk/`，散步中敲門沒人應）、
  一樓大門像百貨公司一樣自動開闔、屋頂偶爾冒出只有半身的青蛙
- 美可的慣用色（炭黑/霧藍灰/焦糖橘/米白）記錄在 CLAUDE.md，token 在 index.css

原本的物理樂園（`usePhysics.ts` + `Playground.tsx`）已經移除。
根目錄的 `demo.html` 是當初從 ebifura.art 反編譯出來的 vanilla 參考實作，
裡面的物理手感值還留著，**請保留不要改動**，之後想復活物理樂園時從它移植回來最快。

## 明暗主題（按使用者時間）

- 規則寫在 `src/hooks/useTheme.ts`：06:00~18:00 亮色，其餘暗色，跨過整點會自己重算
  （分頁被切回前景時也重算一次）。使用者按導覽列最右邊那顆鈕可以自己指定，
  偏好存在 localStorage 的 `mayco-theme`；按回 `auto` 就清掉偏好交還給時間
- 套用方式是在 `<html>` 掛 `data-theme`。`index.html` 有一段**同邏輯的 inline script**
  負責在 React 掛載前先套上，否則暗色主題會先閃一下亮底。改規則要兩邊一起改
- 顏色怎麼翻面全部寫在 `src/index.css` 的 `:root[data-theme="dark"]`：
  Tailwind v4 的 `@theme` 產出的 `--color-*` 本身就是 CSS 變數，重新宣告同名變數就整站翻面，
  **元件端不需要任何 `dark:` 變體**。stone 色階是整條反轉（700 最亮、200 最暗），
  因為站上 stone 只用在文字與邊框
- 元件要白底請用 `bg-panel`（`--color-panel`），**不要寫死 `bg-white`／`#fff`**，
  不然暗色主題下會是一塊白斑
- 公寓場景另有一組 `--sky-*`／`--apt-*`／`--door-*` token，夜晚版是深藍天空、暗磚牆、
  更顯眼的亮窗。canvas 產生的像素標題會透過 `useThemeToken` 觀察 `data-theme` 重畫，
  因為它的顏色是烤進 dataURL 的，不會自己跟著 CSS 翻面
- emoji 素材也不會自己翻面：天空右上那顆白天是 ☀、晚上換成 🌙，
  靠 `apartment.ts` 的 `nightEmoji` 加上 `useCurrentTheme()` 切換。
  要日夜換素材的東西都走這條路，不要各自去讀 localStorage

## 手繪逐格動畫（模擬 GIF 彩蛋）

在拿到真的 GIF 素材之前，逐格彩蛋是用 CSS 模擬的：首頁標題輪盤（`useTitleRoulette.ts`）、
公寓的開門／敲門／探頭（`index.css` 的 `.apt-*`）。

keyframes 都寫在 `src/index.css`，**一律用 `animation-timing-function: steps(1, end)`**，
每個 cycle 切 3~4 格、約 3~6fps。GIF 的味道來自低幀率逐格跳動，
**不要改成 `ease` / `linear`**，一改就變平滑補間，手繪感會整個消失。
（build 後在 CSS 裡會看到 `step-end`，那是 `steps(1, end)` 的等價寫法，正常。）

`prefers-reduced-motion: reduce` 時這些會全部停用。

## 待補的真實資料

目前站上的文字與商品都是示意內容，檔案內都有 `⚠️ 示意資料` 註解標明。
拿到創作者提供的內容後，只需要改 `src/data/` 底下的檔案：

| 檔案 | 待補內容 |
| --- | --- |
| `src/data/characters.ts` | 真實角色設定；把 `img` 填上去背 PNG 路徑（放 `public/characters/`），並依圖片調整 `aspect` 與 `scale`，emoji 佔位就會自動被取代。一個角色只需要一張去背 PNG（短邊 512px 以上、去背後貼齊裁切），公寓門口與角色卡共用同一張 |
| `src/data/apartment.ts` | 公寓的門牌、個性標籤與敲門台詞；哪一戶住誰也在這裡（`characterId`） |
| `src/data/story.ts` | 真實的創作歷程 |
| `src/data/history.ts` | 真實的品牌大事紀與年份 |
| `src/data/products.ts` | 真實商品資料，以及 `shipping.ctaUrl`（實際的 7-11 賣貨便賣場連結，目前暫指向 portaly 總入口） |

`src/data/site.ts` 裡的聯絡資訊（email / Instagram / LINE / portaly）已是真實資料。

## 已知小問題

- 390px 等窄視窗下，首頁的像素標題圖（canvas 產生、寬度固定）會超出畫面被裁切；修法方向是窄視窗時把 pixelate 的放大倍率降一級
- `characters.ts` 有六隻動物，公寓只有五間住戶房（第六戶是頂樓工作室），
  目前「啾啾」沒有分配到房間，換人請改 `src/data/apartment.ts` 的 `characterId`
