<div align="center" id="top">

<!-- HEADER STYLE: CLASSIC -->

<div align="center">

<code>─────&nbsp;✦&nbsp;─────</code>

# 作品典藏錄 · CODEX OPERUM

<em>翻閱一本書，而非滑過一個網頁。</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/your-username/your-repo?style=flat&logo=git&logoColor=white&color=C9A227" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/your-username/your-repo?style=flat&color=C9A227" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/your-username/your-repo?style=flat&color=C9A227" alt="repo-language-count">

<em>使用的工具與技術：</em>

<img src="https://img.shields.io/badge/Astro-BC52EE.svg?style=flat&logo=astro&logoColor=white" alt="Astro">
	<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
	<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
	<img src="https://img.shields.io/badge/CSS-663399.svg?style=flat&logo=css&logoColor=white" alt="CSS">
	<img src="https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=markdown&logoColor=white" alt="Markdown">
	<img src="https://img.shields.io/badge/YAML-CB171E.svg?style=flat&logo=yaml&logoColor=white" alt="YAML">
</div>
<br>

</div>

---

### 目錄

- [總覽](#總覽)
- [特色](#特色)
- [專案結構](#專案結構)
    - [檔案索引](#檔案索引)
- [開始使用](#開始使用)
    - [環境需求](#環境需求)
    - [安裝](#安裝)
    - [開發與建置](#開發與建置)
    - [測試](#測試)
- [自訂內容](#自訂內容)
- [運作原理](#運作原理)
- [參與貢獻](#參與貢獻)
- [授權](#授權)
- [致謝](#致謝)

---

## 總覽

一份以「翻閱古籍」為互動核心的個人作品集網站。作品條目寫在 Markdown 與 YAML 裡，建置時自動排頁、編頁碼、產生目錄；前端則以自製翻頁引擎呈現皮革書封、燙金書口與逐頁翻動的動畫。

**Why 作品典藏錄？**

本專案把作品集做成一本真的能翻的書，而不是一頁往下滑的清單。核心特色包含：

- 📖 **建置期組書**：頁碼、跨頁奇偶對齊、目錄跳頁全部在建置時算好，不需人工維護頁號。
- ✍️ **內容與呈現分離**：新增一個 Markdown 檔就是新增一個作品條目，章節結構寫在 `site.yaml`。
- 🔥 **自製翻頁引擎**：翻頁時序與佇列集中管理，桌面雙頁跨頁、手機單頁滑動。
- 🕯️ **canvas 特效**：開場燙金燃燒與環境塵光改以單一 canvas 重繪，避開行動裝置的合成層開銷。
- 📐 **自動縮字排版**：逐頁量測內文高度，過長時小步降字級以保住頁底留白。
- ✅ **型別與結構驗證**：TypeScript strict 搭配 Zod schema，YAML 缺欄位會在建置階段就失敗。

---

## 特色

|      | 元件              | 細節                                 |
| :--- | :--------------- | :----------------------------------- |
| ⚙️  | **架構**          | <ul><li>Astro 靜態站，單一路由 `src/pages/index.astro` 輸出整本書</li><li>組書邏輯集中一處：蒐集內容 → 排頁 → 算 `goto` → 渲染進 `<template id="tpl-pages">`</li><li>頁碼即 `<section>` 順序（0 起算），跨頁號由 `(P+1)/2` 推導</li><li>`BookLayout.astro` 以 `?raw` + `is:inline` 原樣輸出 CSS/JS，繞過 Vite 打包以免動到引擎</li></ul> |
| 🔩 | **程式品質**       | <ul><li>`astro/tsconfigs/strict` 嚴格型別</li><li>Zod schema 驗證 `site.yaml` 與 `timeline.yaml`，欄位缺漏即建置失敗</li><li>註解記錄修改日期與決策理由（如破圖修復、熱區移除）</li></ul> |
| 📄 | **文件**          | <ul><li>`CLAUDE.md` / `AGENTS.md` 記錄開發流程與 Astro 官方指引連結</li><li>原始碼中文註解密集，關鍵演算法附推導說明</li></ul> |
| 🔌 | **整合**          | <ul><li>Astro Content Collections，`glob` loader 掃 `**/*.md`</li><li>`marked` 將條目正文轉 HTML，段落補上 `.body` 樣式</li><li>`js-yaml` 讀取站台設定與經歷時間軸</li><li>Google Fonts：Cinzel、Cinzel Decorative、Noto Serif TC</li></ul> |
| 🧩 | **模組化**        | <ul><li>8 個頁面型別各自成元件：封面／扉頁／目錄／章名／列表／摘要跨頁／時間軸／後記</li><li>4 支獨立前端腳本：翻頁引擎、開場特效、環境粒子、縮字排版</li><li>內容（`yaml`/`md`）與呈現（`astro`/`css`）完全分離</li></ul> |
| ⚡️  | **效能**          | <ul><li>粒子特效由 18 個帶 `blur` 的 DOM 節點改為單一 canvas 每幀重繪，貼圖預先渲染</li><li>`prefers-reduced-motion` 與手機斷點完全不啟動粒子</li><li>單頁模式僅對真正溢出的頁面加 `overflow-y`，避免大量可捲動合成層造成翻頁破圖</li><li>翻頁時序集中於單一 `T` 常數，消除 CSS 與 JS 兩處數字不同步導致的動畫破圖</li></ul> |
| 🧪 | **測試**          | <ul><li>**目前無自動化測試**：`package.json` 未定義 test script，也未安裝測試框架</li></ul> |
| 📦 | **相依套件**       | <ul><li>執行時相依僅 3 個：`astro ^7.0.7`、`js-yaml ^5.2.1`、`marked ^18.0.6`</li><li>Node.js `>=22.12.0`（`engines` 欄位）</li><li>以 `package-lock.json` 鎖版，套件管理器為 npm</li></ul> |
| 🚀 | **擴充性**        | <ul><li>新增作品＝新增一個 `.md`，排頁與頁碼自動重算</li><li>章節定義在 `site.yaml`，含章名、紋飾、題辭</li><li>目錄頁碼透過 `data-toc-page` 傳給引擎，內容擴充後自動跟隨</li><li>`placeholder: true` 讓條目只出現在列表、不產生摘要跨頁</li></ul> |

---

## 專案結構

```sh
└── MyPortfolio/
    ├── AGENTS.md
    ├── CLAUDE.md
    ├── README.md
    ├── astro.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.ico
    │   └── favicon.svg
    └── src/
        ├── components/
        ├── content/
        ├── layouts/
        ├── pages/
        ├── scripts/
        └── styles/
```

### 檔案索引

<details open>
	<summary><b><code>MYPORTFOLIO/</code></b></summary>
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			</div>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
					<th style='text-align: left; padding: 8px;'>說明</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>宣告專案識別（<code>codex-operum</code>）、Node.js 版本下限與三個執行時相依套件，並定義 dev／build／preview 三個 Astro 指令。作為 npm 的進入點，決定整個站台的建置與預覽流程。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/astro.config.mjs'>astro.config.mjs</a></b></td>
					<td style='padding: 8px;'>提供 Astro 的組態進入點，目前維持空設定，代表整個站台不依賴任何 integration 或 adapter，純靜態輸出。保留此檔以便日後加入 sitemap、圖片最佳化等擴充。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/tsconfig.json'>tsconfig.json</a></b></td>
					<td style='padding: 8px;'>繼承 Astro 的 strict 預設組態，納入自動產生的型別宣告並排除建置輸出。確保元件 props 與 Zod 推導出的內容型別在編輯器與建置階段都受檢查。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/CLAUDE.md'>CLAUDE.md</a></b></td>
					<td style='padding: 8px;'>記錄開發慣例：以背景模式啟動 dev server，以及依任務類型該先查閱的 Astro 官方指引。作為 AI 協作與新進開發者的行為準則。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/AGENTS.md'>AGENTS.md</a></b></td>
					<td style='padding: 8px;'>與 <code>CLAUDE.md</code> 內容一致，供其他遵循 AGENTS.md 慣例的工具讀取相同的開發指引。</td>
				</tr>
			</table>
		</blockquote>
	</details>
	<details>
		<summary><b>src</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ src</b></code>
			</div>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
					<th style='text-align: left; padding: 8px;'>說明</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content.config.ts'>content.config.ts</a></b></td>
					<td style='padding: 8px;'>轉出 <code>src/content/config.ts</code> 的定義，滿足 Astro 5+ 對 content 組態位置的要求，同時讓實際 schema 依遷移指南留在 content 目錄內。</td>
				</tr>
			</table>
		</blockquote>
		<details>
			<summary><b>pages</b></summary>
			<blockquote>
				<div class='directory-path' style='padding: 8px 0; color: #666;'>
					<code><b>⦿ src.pages</b></code>
				</div>
				<table style='width: 100%; border-collapse: collapse;'>
				<thead>
					<tr style='background-color: #f8f9fa;'>
						<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
						<th style='text-align: left; padding: 8px;'>說明</th>
					</tr>
				</thead>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/pages/index.astro'>index.astro</a></b></td>
						<td style='padding: 8px;'>擔任整本書的組書程式，也是站台唯一路由。蒐集 YAML 設定與 content collections，依章節逐頁推入單元、插入空白頁維持奇偶對齊、計算目錄與列表的跨頁跳轉編號，再切分條目正文為左右兩頁後渲染。所有頁碼皆在此推導，不人工填寫。</td>
					</tr>
				</table>
			</blockquote>
		</details>
		<details>
			<summary><b>layouts</b></summary>
			<blockquote>
				<div class='directory-path' style='padding: 8px 0; color: #666;'>
					<code><b>⦿ src.layouts</b></code>
				</div>
				<table style='width: 100%; border-collapse: collapse;'>
				<thead>
					<tr style='background-color: #f8f9fa;'>
						<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
						<th style='text-align: left; padding: 8px;'>說明</th>
					</tr>
				</thead>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/layouts/BookLayout.astro'>BookLayout.astro</a></b></td>
						<td style='padding: 8px;'>建立書的外殼：文件標頭、Google Fonts 預連線、scene／book 骨架與頁面範本容器。以 <code>?raw</code> 匯入樣式與四支腳本並 <code>is:inline</code> 原樣輸出，避免打包工具改寫翻頁引擎，並確保特效腳本先於引擎載入。</td>
					</tr>
				</table>
			</blockquote>
		</details>
		<details>
			<summary><b>components</b></summary>
			<blockquote>
				<div class='directory-path' style='padding: 8px 0; color: #666;'>
					<code><b>⦿ src.components</b></code>
				</div>
				<table style='width: 100%; border-collapse: collapse;'>
				<thead>
					<tr style='background-color: #f8f9fa;'>
						<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
						<th style='text-align: left; padding: 8px;'>說明</th>
					</tr>
				</thead>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/CoverPage.astro'>CoverPage.astro</a></b></td>
						<td style='padding: 8px;'>繪製書封：拉丁書名、中文書名、作者，以及四角雙弧線加四芒星紋飾。紋飾以 <code>currentColor</code> 描邊，讓開場燃燒動畫的顏色變化能直接套用到 SVG 上。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/IntroPage.astro'>IntroPage.astro</a></b></td>
						<td style='padding: 8px;'>呈現扉頁，將置中引言與自介文字逐行拆開輸出以保留原始換行。使用羅馬數字頁碼，不計入章節的阿拉伯編號。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/TocPage.astro'>TocPage.astro</a></b></td>
						<td style='padding: 8px;'>列出卷目，每則章節帶編號、名稱、描述與跨頁跳轉目標。跳轉編號由組書程式計算後傳入，點擊即由翻頁引擎接手。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/ChapterPage.astro'>ChapterPage.astro</a></b></td>
						<td style='padding: 8px;'>輸出章名頁，含章次、章名、專屬紋飾符號與題辭。標記 <code>data-toc-btn</code> 以讓引擎注入回目錄按鈕，且必定排在左頁。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/ListPage.astro'>ListPage.astro</a></b></td>
						<td style='padding: 8px;'>渲染章節條目清單，每項顯示標題、摘要與標籤。具跳轉編號者可點擊翻頁，佔位條目則不可點擊。跳轉以跨頁編號書寫，目標落在右頁時另以 <code>gotoSingle</code> 覆寫手機單頁模式的頁碼。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/DetailSpread.astro'>DetailSpread.astro</a></b></td>
						<td style='padding: 8px;'>輸出作品的摘要跨頁：左頁放 eyebrow、標題與正文前半，右頁放正文後半與外連封印。一律成對輸出兩個區段，確保排頁的奇偶對齊不被破壞。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/TimelinePage.astro'>TimelinePage.astro</a></b></td>
						<td style='padding: 8px;'>將學歷或經歷渲染為時間軸，逐項顯示時間、職稱、單位與細項。同一元件渲染兩次構成對開的左右頁，內容過長時由頁內捲動容器承接，不縮字也不裁切。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/EpiloguePage.astro'>EpiloguePage.astro</a></b></td>
						<td style='padding: 8px;'>收束全書的後記頁，置中呈現 EPILOGUE 標記、紋飾與結語文字。位於書末，必要時由組書程式補一空白頁湊成偶數總頁。</td>
					</tr>
				</table>
			</blockquote>
		</details>
		<details>
			<summary><b>scripts</b></summary>
			<blockquote>
				<div class='directory-path' style='padding: 8px 0; color: #666;'>
					<code><b>⦿ src.scripts</b></code>
				</div>
				<table style='width: 100%; border-collapse: collapse;'>
				<thead>
					<tr style='background-color: #f8f9fa;'>
						<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
						<th style='text-align: left; padding: 8px;'>說明</th>
					</tr>
				</thead>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/book.js'>book.js</a></b></td>
						<td style='padding: 8px;'>驅動整本書的翻頁引擎。依斷點建構桌面雙頁或手機單頁結構，管理翻頁佇列、動畫時序與層級，處理點擊跳轉、鍵盤方向鍵與手機滑動手勢，並注入回目錄按鈕。時序常數集中一處，避免樣式與腳本不同步造成的破圖。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/burn-intro.js'>burn-intro.js</a></b></td>
						<td style='padding: 8px;'>演出開場的燙金燃燒特效。火線、光暈與火花全在單一畫布上以 2D 繪圖完成，文字則交由樣式遮罩揭示，時間軸與原本的緩動曲線逐項對齊，以換取行動裝置上穩定的效能。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/ambient.js'>ambient.js</a></b></td>
						<td style='padding: 8px;'>營造環境塵光氛圍。以單一畫布每幀重繪帶景深、搖曳與明滅的粒子，並偶發暖橘餘燼；貼圖預先渲染以降低成本。偵測到降低動態偏好或手機斷點時完全不啟動。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/fit-page.js'>fit-page.js</a></b></td>
						<td style='padding: 8px;'>解決固定頁高導致的內文裁切。排版後逐頁量測，超出時小步調降字級直到連頁碼一起放得下，保住頁底留白。單頁模式改為僅對真正溢出的頁面啟用捲動，避免過多合成層。</td>
					</tr>
				</table>
			</blockquote>
		</details>
		<details>
			<summary><b>styles</b></summary>
			<blockquote>
				<div class='directory-path' style='padding: 8px 0; color: #666;'>
					<code><b>⦿ src.styles</b></code>
				</div>
				<table style='width: 100%; border-collapse: collapse;'>
				<thead>
					<tr style='background-color: #f8f9fa;'>
						<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
						<th style='text-align: left; padding: 8px;'>說明</th>
					</tr>
				</thead>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/styles/book.css'>book.css</a></b></td>
						<td style='padding: 8px;'>定義全書視覺：紙張質感、皮革書脊、燙金書口、翻頁的三維變換與陰影，以及桌面雙頁與手機單頁兩套版面。同時提供頁內元素的排版規則與可捲動頁的樣式切換。</td>
					</tr>
				</table>
			</blockquote>
		</details>
		<details>
			<summary><b>content</b></summary>
			<blockquote>
				<div class='directory-path' style='padding: 8px 0; color: #666;'>
					<code><b>⦿ src.content</b></code>
				</div>
				<table style='width: 100%; border-collapse: collapse;'>
				<thead>
					<tr style='background-color: #f8f9fa;'>
						<th style='width: 30%; text-align: left; padding: 8px;'>檔案</th>
						<th style='text-align: left; padding: 8px;'>說明</th>
					</tr>
				</thead>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/config.ts'>config.ts</a></b></td>
						<td style='padding: 8px;'>定義所有內容的結構契約：軟體與論文共用的條目 schema，以及站台設定與學歷經歷時間軸的驗證規則。透過 glob loader 掃入 Markdown，欄位缺漏或型別不符會在建置階段即時失敗。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/site.yaml'>site.yaml</a></b></td>
						<td style='padding: 8px;'>掌管全書的骨架設定：書名、作者、扉頁引言與自介、後記，以及三個章節的章次、名稱、紋飾與題辭。修改此檔即可調整書的結構，無須動到程式。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/experience/timeline.yaml'>experience/timeline.yaml</a></b></td>
						<td style='padding: 8px;'>彙整學歷與工作經歷，每筆含 <code>kind</code>（work／edu）、時間、職稱、單位與選填細項。單一檔案供對開兩頁取用：<code>edu</code> 排左頁、<code>work</code> 排右頁，順序即渲染順序。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/software'>software/*.md</a></b></td>
						<td style='padding: 8px;'>收錄軟體作品條目，共五筆：星圖引擎 StarChart Engine、Reflexion Search、符文編譯器 Runescript、BRE 考卷自動批改系統、遊戲小閣 Ludi。前言區塊描述標題、摘要、標籤與外連，正文則構成摘要跨頁的左右兩頁；其中符文編譯器標記為佔位條目，僅出現在列表。</td>
					</tr>
					<tr style='border-bottom: 1px solid #eee;'>
						<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/papers'>papers/*.md</a></b></td>
						<td style='padding: 8px;'>收錄論文研究條目，目前含一筆示意範例。與軟體條目共用同一份 schema，僅在摘要頁採用較小字級以容納較長的標題。</td>
					</tr>
				</table>
			</blockquote>
		</details>
	</details>
</details>

---

## 開始使用

### 環境需求

- **執行環境：** Node.js `>=22.12.0`
- **套件管理器：** npm（專案以 `package-lock.json` 鎖版）

### 安裝

從原始碼建置並安裝相依套件：

1. **複製儲存庫：**

    ```sh
    ❯ git clone git@github.com:your-username/your-repo.git
    ```

2. **進入專案目錄：**

    ```sh
    ❯ cd MyPortfolio
    ```

3. **安裝相依套件：**

    ```sh
    ❯ npm install
    ```

### 開發與建置

啟動開發伺服器（預設 <http://localhost:4321>）：

```sh
❯ npm run dev
```

建置靜態站台至 `dist/`：

```sh
❯ npm run build
```

在本機預覽建置結果：

```sh
❯ npm run preview
```

### 測試

本專案目前**沒有自動化測試**：`package.json` 未定義 test script，也未安裝任何測試框架。驗證方式為執行 `npm run build`（Zod schema 會在此階段檢查內容欄位）後以 `npm run preview` 手動翻閱。

---

## 自訂內容

站台內容目前為示意資料，全部集中在 `src/content/`，改完即生效：

| 要改什麼 | 改哪個檔 |
| :--- | :--- |
| 書名、作者、扉頁自介、後記 | `src/content/site.yaml` |
| 章節數量、章名、紋飾、題辭 | `src/content/site.yaml` 的 `chapters` |
| 學歷與工作經歷時間軸 | `src/content/experience/timeline.yaml` |
| 軟體作品條目 | 於 `src/content/software/` 新增 `.md` |
| 論文研究條目 | 於 `src/content/papers/` 新增 `.md` |

新增條目的前言欄位（`title`、`summary`、`order` 為必填）：

```yaml
---
title: 專案名稱
summary: 一句話摘要，顯示在列表頁。
tags: [TypeScript, WebGL]
link: https://github.com/your/repo   # 選填，右頁封印外連
linkLabel: 前往 GitHub 詳閱全文        # 選填
order: 1                              # 列表排序
placeholder: false                    # true 則只上列表、不產生摘要跨頁
eyebrow: Project · 專案名稱            # 選填，摘要左頁 eyebrow
pageTitle: 顯示用標題                  # 選填，摘要左頁標題
---
```

正文可用 `<!-- pagebreak -->` 指定左右頁的切點；未指定時依空行區塊自動對半分。頁碼、目錄與跳轉編號都會在下次建置時自動重算。

---

## 運作原理

1. **蒐集**：`index.astro` 以 `js-yaml` 讀入設定、以 `getCollection` 取出條目，並用 Zod schema 驗證。
2. **排頁**：依章節順序推入頁面單元。章名頁必須落在左頁（奇數頁），不足時自動插入空白裝飾頁補位；總頁數為奇數時於書末補一頁。
3. **算跳頁**：頁碼即單元順序（0 起算）。攤開狀態下左頁為 `2f-1`、右頁為 `2f`，因此跳到左頁頁碼 `P` 的跨頁編號為 `(P+1)/2`——全部由建置程式推導。
4. **渲染**：所有頁面輸出為 `<template id="tpl-pages">` 內的 `<section>` 序列，順序即頁碼。
5. **建構**：`book.js` 讀取範本，依斷點把每個 `<section>` 組成紙張（桌面一張紙＝正反兩頁，手機一張紙＝單頁）。
6. **微調**：`fit-page.js` 逐頁量測，桌面模式縮字、單頁模式僅對溢出頁啟用捲動。

---

## 參與貢獻

這是個人作品集專案，但仍歡迎回報問題或提出建議：

- **🐛 [回報問題](https://github.com/your-username/your-repo/issues)**：提交發現的缺陷或功能建議。

<details closed>
<summary>貢獻流程</summary>

1. **Fork 儲存庫**：將專案 fork 到自己的 GitHub 帳號。
2. **複製到本機**：
   ```sh
   git clone git@github.com:your-username/your-repo.git
   ```
3. **建立新分支**：取一個具描述性的名稱。
   ```sh
   git checkout -b new-feature-x
   ```
4. **進行修改**：在本機開發並以 `npm run build` 驗證。
5. **提交修改**：訊息清楚描述改動內容。
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **推送分支**：
   ```sh
   git push origin new-feature-x
   ```
7. **開啟 Pull Request**：對原儲存庫發出 PR，待審核後合併。

</details>

---

## 授權

本專案**尚未指定授權條款**——儲存庫中沒有 `LICENSE` 檔，`package.json` 也沒有 `license` 欄位。在未明示授權的情況下，預設保留全部權利。若打算開放他人使用，建議加入一份 `LICENSE` 並在 `package.json` 補上對應欄位。

---

## 致謝

本專案建立在以下開放原始碼專案與資源之上：

- [Astro](https://astro.build) — 靜態站台框架與 content collections
- [marked](https://github.com/markedjs/marked) — Markdown 轉 HTML
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML 解析
- [Zod](https://zod.dev) — 內容結構驗證（隨 Astro 提供）
- [Cinzel](https://fonts.google.com/specimen/Cinzel)、[Cinzel Decorative](https://fonts.google.com/specimen/Cinzel+Decorative)、[Noto Serif TC](https://fonts.google.com/noto/specimen/Noto+Serif+TC) — 經由 Google Fonts 提供的字體

<div align="left"><a href="#top">回到頂端</a></div>

---
