<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

<code>─────&nbsp;✦&nbsp;─────</code>

# 作品典藏錄 · CODEX OPERUM

<em>翻閱一本書，而非滑過一個網頁 — 基於 Astro 的古典古籍互動作品集</em>

**🔗 線上展示：[rowing195.github.io/Portfolio-public](https://rowing195.github.io/Portfolio-public/)**

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/your-username/your-repo?style=flat&logo=git&logoColor=white&color=C9A227" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/your-username/your-repo?style=flat&color=C9A227" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/your-username/your-repo?style=flat&color=C9A227" alt="repo-language-count">

<br>

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/Astro-BC52EE.svg?style=default&logo=Astro&logoColor=white" alt="Astro">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=default&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/CSS-663399.svg?style=default&logo=CSS&logoColor=white" alt="CSS">
<img src="https://img.shields.io/badge/YAML-CB171E.svg?style=default&logo=YAML&logoColor=white" alt="YAML">
<img src="https://img.shields.io/badge/JSON-000000.svg?style=default&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=default&logo=npm&logoColor=white" alt="npm">

</div>
<br>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
    - [Project Index](#project-index)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)
- [Customization](#customization)
- [Architecture](#architecture)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**作品典藏錄 (CODEX OPERUM)** 是一個以「翻閱古籍」為核心互動概念的個人作品集網站。相較於傳統單頁捲動式網頁，本專案將個人履歷、專案作品與學術研究重新組織為一本具備皮革書封、燙金書口與真實三維翻頁動畫的虛擬典籍。

全站採用 **Astro 5+** 靜態建置架構，達成內容（Markdown / YAML）與呈現（Astro / CSS / JS）的完整分離。頁碼編排、雙頁奇偶對齊、目錄連結等邏輯皆在建置時期（Build Time）精確推導計算，兼具古典美學與優異的前端執行效能。

---

## Features

- 📖 **建置期組書 (Build-time Pagination)**：自動進行頁碼推導、跨頁對齊與目錄頁碼綁定，無需人工手動設定頁碼。
- ✍️ **內容與呈現分離 (Content Decoupling)**：新增 Markdown 檔案即自動擴充條目，並透過 `site.yaml` 彈性定義全站結構與章節題辭。
- 🔥 **自製 3D 翻頁引擎 (Custom Flip Engine)**：原生 JavaScript 實作翻頁佇列與時序控制，支援桌面對開雙頁模式與手機單頁滑動體驗。
- 🕯️ **Canvas 輕量粒子特效 (Optimized Particle FX)**：開場燙金燃燒與環境塵光全面改為單一 Canvas 重繪，顯著降低流動裝置之合成層開銷。
- 📐 **自動縮字與自適應排版 (Dynamic Auto-fit Typography)**：即時測量內文高度，於內容過長時微幅微調字級，確保頁底留白一致。
- ✅ **嚴格型別與 Schema 驗證 (Type Safety & Validation)**：TypeScript strict 模式與 Zod Schema 雙重防護，YAML 資料欄位缺漏將於建置期立即攔截。

---

## Project Structure

```sh
└── your-repo/
    ├── AGENTS.md
    ├── astro.config.mjs
    ├── CLAUDE.md
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── README_new.md
    ├── tsconfig.json
    ├── public/
    │   ├── favicon.ico
    │   └── favicon.svg
    └── src/
        ├── components/
        │   ├── ChapterPage.astro
        │   ├── CoverPage.astro
        │   ├── DetailSpread.astro
        │   ├── EpiloguePage.astro
        │   ├── IntroPage.astro
        │   ├── ListPage.astro
        │   ├── TimelinePage.astro
        │   └── TocPage.astro
        ├── content/
        │   ├── experience/
        │   │   └── timeline.yaml
        │   ├── papers/
        │   │   └── sample-paper.md
        │   ├── software/
        │   │   ├── automatic-grading-sys.md
        │   │   ├── html-games.md
        │   │   ├── reflexion-search.md
        │   │   ├── runescript.md
        │   │   └── starchart-engine.md
        │   ├── config.ts
        │   └── site.yaml
        ├── content.config.ts
        ├── layouts/
        │   └── BookLayout.astro
        ├── pages/
        │   └── index.astro
        ├── scripts/
        │   ├── ambient.js
        │   ├── book.js
        │   ├── burn-intro.js
        │   └── fit-page.js
        └── styles/
            └── book.css
```

### Project Index

<details open>
	<summary><b><code>your-repo/</code></b></summary>
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			</div>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>定義專案元資料（<code>codex-operum</code>）、Node.js 版本需求與 Astro 相關指令（dev / build / preview）。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/astro.config.mjs'>astro.config.mjs</a></b></td>
					<td style='padding: 8px;'>Astro 專案主要設定檔，維持極簡靜態輸出設定。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/tsconfig.json'>tsconfig.json</a></b></td>
					<td style='padding: 8px;'>TypeScript 嚴格型別設定檔，繼承 <code>astro/tsconfigs/strict</code>。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/CLAUDE.md'>CLAUDE.md</a></b></td>
					<td style='padding: 8px;'>記錄專案開發規範與啟動慣例。</td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/AGENTS.md'>AGENTS.md</a></b></td>
					<td style='padding: 8px;'>AI 代理與開發者團隊協作行為準則指引。</td>
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
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content.config.ts'>content.config.ts</a></b></td>
					<td style='padding: 8px;'>轉出 Content Collection 設定，相容 Astro 5 規範。</td>
				</tr>
			</table>
			<details>
				<summary><b>pages</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.pages</b></code>
					</div>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/pages/index.astro'>index.astro</a></b></td>
							<td style='padding: 8px;'>全站唯一路由，組書核心 logic：讀取內容、計算頁號、對齊奇偶頁並渲染為 DOM 範本。</td>
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
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/layouts/BookLayout.astro'>BookLayout.astro</a></b></td>
							<td style='padding: 8px;'>書本全景 Layout：包含 HTML HEAD、字型載入、頁面主容器與腳本原樣嵌入 (`is:inline`)。</td>
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
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/CoverPage.astro'>CoverPage.astro</a></b></td>
							<td style='padding: 8px;'>古典典藏風格的皮革書封與燙金花紋組件。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/IntroPage.astro'>IntroPage.astro</a></b></td>
							<td style='padding: 8px;'>扉頁引言與作者個人簡介頁面。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/TocPage.astro'>TocPage.astro</a></b></td>
							<td style='padding: 8px;'>動態編排之全書目錄頁組件。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/ChapterPage.astro'>ChapterPage.astro</a></b></td>
							<td style='padding: 8px;'>各章節首頁 (Chapter Cover)，附帶專屬紋飾與題辭。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/ListPage.astro'>ListPage.astro</a></b></td>
							<td style='padding: 8px;'>條目清單頁面，顯示專案/論文清單與頁碼跳轉按鈕。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/DetailSpread.astro'>DetailSpread.astro</a></b></td>
							<td style='padding: 8px;'>作品詳情跨頁組件，包含內文展示與外部連結。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/TimelinePage.astro'>TimelinePage.astro</a></b></td>
							<td style='padding: 8px;'>學歷與工作經歷的時間軸展示組件。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/components/EpiloguePage.astro'>EpiloguePage.astro</a></b></td>
							<td style='padding: 8px;'>全書結尾後記頁組件。</td>
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
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/book.js'>book.js</a></b></td>
							<td style='padding: 8px;'>自製 3D 翻頁互動引擎，控制動畫佇列、鍵盤與滑動手勢。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/burn-intro.js'>burn-intro.js</a></b></td>
							<td style='padding: 8px;'>Canvas 2D 燙金燃燒開場動畫控制腳本。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/ambient.js'>ambient.js</a></b></td>
							<td style='padding: 8px;'>Canvas 環境浮游光點粒子特效腳本。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/scripts/fit-page.js'>fit-page.js</a></b></td>
							<td style='padding: 8px;'>排版文字溢出偵測與字體大小動態調整微調腳本。</td>
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
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/styles/book.css'>book.css</a></b></td>
							<td style='padding: 8px;'>全站主 CSS：涵蓋典藏皮革質感、燙金樣式、透視變換與響應式雙/單頁版面。</td>
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
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/config.ts'>config.ts</a></b></td>
							<td style='padding: 8px;'>Zod Schema 定義檔，強型別驗證 Markdown 與 YAML 資料結構。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/site.yaml'>site.yaml</a></b></td>
							<td style='padding: 8px;'>全站基本設定檔：包含書名、作者簡介、扉頁語錄與各章節架構。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/experience/timeline.yaml'>experience/timeline.yaml</a></b></td>
							<td style='padding: 8px;'>學歷與工作經歷資料檔案。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/software'>software/*.md</a></b></td>
							<td style='padding: 8px;'>軟體作品集 Content Collection (星圖引擎、Reflexion Search、Runescript 等條目)。</td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/your-username/your-repo/blob/main/src/content/papers'>papers/*.md</a></b></td>
							<td style='padding: 8px;'>論文與學術研究 Content Collection。</td>
						</tr>
					</table>
				</blockquote>
			</details>
	</details>
</details>

---

## Getting Started

### Prerequisites

本專案需要以下開發環境：

- **Node.js**: `>=22.12.0`
- **Package Manager**: `npm` (鎖定檔 `package-lock.json`)

### Installation

選定目錄並複製儲存庫，安裝必要相依套件：

1. **Clone the repository:**

    ```sh
    git clone git@github.com:your-username/your-repo.git
    ```

2. **Navigate to the project directory:**

    ```sh
    cd your-repo
    ```

3. **Install the dependencies:**

    ```sh
    npm install
    ```

### Usage

**啟動本地開發伺服器 (Local Dev Server):**

```sh
npm run dev
```

**建置正式產出檔 (Production Build):**

```sh
npm run build
```

**預覽建置結果 (Preview Build):**

```sh
npm run preview
```

### Testing

本專案採取靜態建置防護，任何 YAML 或 Markdown 欄位缺漏將會在 `npm run build` 時由 Zod Schema 與 TypeScript 立即回報編譯錯誤。建議手動以 Preview 模式進行視覺與翻頁互動驗證。

---

## Customization

內容資料皆位於 `src/content/`，修改即生效：

| 自訂項目 | 對應檔案/路徑 |
| :--- | :--- |
| 書名、作者、扉頁語錄、後記 | `src/content/site.yaml` |
| 章節清單與題辭 | `src/content/site.yaml` 之 `chapters` 區塊 |
| 學歷與經歷時間軸 | `src/content/experience/timeline.yaml` |
| 新增軟體專案 | 於 `src/content/software/` 目錄新增 `.md` 檔案 |
| 新增論文研究 | 於 `src/content/papers/` 目錄新增 `.md` 檔案 |

---

## Architecture

1. **資料讀取 (Ingestion)**：`index.astro` 透過 `getCollection` 與 `js-yaml` 載入 Markdown 與 YAML，經 Zod 校驗。
2. **建置分頁 (Pagination)**：依章節順序佈局，自動補齊空白頁以維持奇偶跨頁對齊。
3. **動態目錄 (Dynamic TOC)**：建置期算算出目標頁碼 `(P+1)/2` 並寫入 HTML DOM 屬性。
4. **前端渲染 (DOM Rendering)**：前端 `book.js` 根據設備螢幕寬度（桌面雙頁 / 手機單頁）動態裝載 3D 書頁容器。

---

## Roadmap

- [x] **`Phase 1`**: 建立 3D 典籍翻頁引擎與雙頁對開系統
- [x] **`Phase 2`**: 整合 Astro Content Collections 與 Zod 內容校驗
- [x] **`Phase 3`**: 優化 Canvas 開場燃燒特效與浮游粒子性能
- [ ] **`Phase 4`**: 支援動態深色 / 淺色典籍主題切換
- [ ] **`Phase 5`**: 加入專案關鍵字全文搜尋與標籤篩選

---

## Contributing

歡迎提交 Issue 或 PR 共同改善《作品典藏錄》：

- **🐛 [Report Issues](https://github.com/your-username/your-repo/issues)**：提交 Bug 或建議新功能。
- **💡 [Submit Pull Requests](https://github.com/your-username/your-repo/pulls)**：檢視開放中的 PR 或提交修改。

---

## License

本專案版權由原作者所有。如需引用或商業用途請先聯繫原作者。

---

## Acknowledgments

- **[Astro Framework](https://astro.build)** — 高效能靜態網頁生成器
- **[readme-ai](https://github.com/eli64s/readme-ai)** — 自動化 README 生成與架構排版工具
- **[Google Fonts](https://fonts.google.com)** — 提供 Cinzel, Cinzel Decorative 及 Noto Serif TC 古典字型

<div align="right">

[![][back-to-top]](#top)

</div>

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
