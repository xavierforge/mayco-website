# 美可女子 Mayco 角色網站

品牌網站。架構與部署見 README.md，這裡放「寫程式時要遵守的事」。

## 美可的慣用色（出自 2026 明信片與貼紙系列）

從創作者的實際作品（`2026明信片90*90-200張.pdf`、`assets-stickers/`）解析出的四色盤，
已建成 `src/index.css` @theme 的 token（暗色主題有各自的變體，元件端不要寫死色碼）：

| Token | 亮色值 | 用途 |
| --- | --- | --- |
| `--color-ink` | `#3a3a38` | 炭黑：描邊、深底（明信片的底色就是它） |
| `--color-mist` | `#b7c7c6` | 霧藍灰：角色主色（灰藍貓、青蛙、盆栽葉都是這個色系） |
| `--color-caramel` | `#c8885a` | 焦糖橘：點綴與互動提示（耳機、花盆、格紋桌布） |
| `--color-milk` | `#d9d8c7` | 米白：炭底上的文字（明信片手寫字的顏色） |

用法慣例：**炭底 + 米白字**是美可作品裡最典型的組合（明信片手寫字），
站上的小型提示（叩叩叩、路燈的 ?）照這個組合或焦糖橘來做。
品牌主橘 `--color-mayco`（#e8622d）仍是 CTA 與標題的主色，慣用色是輔助盤，兩者並存。

## 규則

- 首頁公寓的所有尺寸以「格」為單位，乘上 `useSceneLayout` 反推的整數倍率；不要寫死 px 或視窗斷點
- 像素質感的動畫一律 `steps()`，不要 ease/linear
- 元件用 `bg-panel`、`text-stone-*` 等 token utilities，不要寫死 `#fff`／`bg-white`（暗色主題會翻面）
- 角色圖 `img` 路徑一律經 `asset()`（GitHub Pages 子路徑）；`aspect` 要跟檔案實際長寬一致
- 原始素材在 `assets-stickers/`（不進版控），處理後的去背檔在 `public/characters/` 與 `public/street/`
