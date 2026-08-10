# 內容編輯指南

這份指南教你怎麼在**現在的 Astro 版本**填寫、修改作品典藏錄的內容。

> 舊版指南(直接改 `portfolio-book.html`、手算 `data-goto` 跨頁編號)已經過時 —— 專案已重寫成 Astro,`portfolio-book.html` 這個檔案不存在了。現在**不用手動算頁碼**,所有排頁、目錄跳轉都在建置時自動算好。你只需要改 `src/content/` 底下的 YAML 與 Markdown 檔。

---

## 一、內容都在哪裡

```
src/content/
├── site.yaml              # 書名、作者、扉頁、後記、章節定義
├── experience/
│   └── timeline.yaml       # 學歷與工作經歷時間軸
├── software/
│   └── *.md                # 軟體作品條目(一檔一項目)
└── papers/
    └── *.md                # 論文研究條目(一檔一項目)
```

改完存檔,`npm run dev` 的畫面會自動重整;`npm run build` 時 Zod 會驗證欄位,缺東西或型別錯會直接報錯擋下建置。

---

## 二、改書本資訊 → `site.yaml`

```yaml
bookTitle: 作品典藏錄        # 中文書名(封面)
bookTitleLatin: CODEX OPERUM # 拉丁書名(封面)
author: 你的名字

intro:
  quote: |-
    「扉頁引言,
    可以換行。」
  text: |-
    扉頁下方較小的自我介紹文字,換行會保留。

epilogue: |-
  後記文字,書的最後一頁。
```

- `quote` / `text` / `epilogue` 用 `|-` 開頭的區塊寫法,換行照原樣保留。
- 這幾項是全書共用的骨架資訊,改了立即全書生效,不用動任何程式碼。

---

## 三、改章節 → `site.yaml` 的 `chapters`

```yaml
chapters:
  - id: software          # 固定值:software / papers / experience 三選一
    no: CHAPTER I          # 章次標示
    name: 軟體作品          # 章名
    desc: 親手打造的程式與工具  # 章名頁副標
    ornament: ⚙             # 章節紋飾符號(一個字元/emoji)
    tagline: |-
      章名頁的題辭,
      可換行。
    listEyebrow: Chapter I · 軟體作品   # 列表頁頂端小標
```

`id` 決定這一章要抓哪個 content collection 的資料(`software` 抓 `src/content/software/`,`papers` 抓 `src/content/papers/`,`experience` 抓 `timeline.yaml`)。**目前只支援這三種**,若要開新章節類型需要動到程式邏輯(`src/pages/index.astro`),不只是改 YAML。

三個章節在陣列中的順序,就是書裡出現的順序。

---

## 四、改學歷 / 經歷時間軸 → `timeline.yaml`

```yaml
- kind: work              # work = 實心金點 / edu = 空心秘青環
  when: 2025.03 — 2026.06
  role: 職稱
  org: 公司或學校名稱
  points:                  # 選填,細項條列
    - 做了什麼事,一行一條。
    - 第二條細項。

- kind: edu
  when: 2022 — 2024
  role: 學位名稱
  org: 學校名稱
  # 沒有 points 也可以,學歷條目常常不寫
```

- **排序是手動的**,不會依日期字串自動排 —— 陣列裡由上到下就是渲染順序,重疊的學歷/工作期間要自己決定先後。目前是「起始時間新到舊」排列,新增時比照即可。
- `work` 排右頁、`edu` 排左頁(對開兩頁),不用另外指定。

---

## 五、新增 / 編輯軟體作品或論文

每個作品是 `src/content/software/` 或 `src/content/papers/` 底下**一個 `.md` 檔**。檔名隨意(建議英文 kebab-case,如 `my-new-project.md`),不影響顯示。

### Frontmatter 欄位

```yaml
---
title: 專案名稱                        # 必填,列表與摘要頁標題
summary: 一句話摘要,顯示在列表頁。         # 必填
tags: [TypeScript, WebGL]              # 選填,預設空陣列
link: https://github.com/your/repo     # 選填,右頁封印外連按鈕
linkLabel: 前往 GitHub 詳閱全文          # 選填,連結按鈕文字
order: 1                               # 必填,決定在列表中的排序
placeholder: false                      # 選填,預設 false
eyebrow: Project · 專案名稱              # 選填,摘要左頁小標(預設「Project · {title}」)
pageTitle: 顯示用標題                    # 選填,摘要左頁大標(預設同 title)
---
```

- `title`、`summary`、`order` 是**必填**,少填會在 `npm run build` 時報錯。
- `placeholder: true`:只出現在列表頁,**不會**產生對應的摘要跨頁、也不能點擊。適合「之後再補」的佔位項目(參考 `runescript.md`)。

### 正文(摘要跨頁的內容)

```markdown
#### 簡介

左頁內容,說明專案背景、解決什麼問題。

- 功能條列也可以

<!-- pagebreak -->

#### 技術棧

右頁內容,從這裡開始。
```

- 用 `<!-- pagebreak -->` 這一行標記左右頁的切點。
- **沒寫 `pagebreak` 的話**,系統會依空行區塊自動對半分,但版面可能不如預期,建議手動標記。
- `placeholder: true` 的條目不需要寫正文(只留 frontmatter 即可)。

新增/刪除作品條目後,**不用管頁碼或 `data-goto`** —— 目錄、列表跳轉編號、跨頁對齊,下次建置時全部自動重算。

---

## 六、其他可調整的地方(程式層,非內容)

以下需要改程式碼(`.astro` / `.css`),不是改 `src/content/`:

| 想改什麼 | 去哪改 |
|---|---|
| 整體配色(金色、羊皮紙、皮革色) | `src/styles/book.css` 的顏色變數 |
| 頁面尺寸 | `src/styles/book.css` |
| 開場燃燒特效 | `src/scripts/burn-intro.js` |
| 桌面 / 手機切換門檻(預設 720px) | `src/scripts/book.js` 與 `src/styles/book.css` 各一處,需同步改 |
| 8 種頁面版型(封面、目錄、時間軸等) | `src/components/*.astro` |

這些改動影響全站呈現,改之前建議先確認真的需要,一般填內容不需要碰這裡。

---

## 七、開發與部署

**本機預覽**(<http://localhost:4321>):

```bash
npm run dev
```

**建置**(內容驗證會在這步跑,YAML/Markdown 缺欄位會報錯擋下):

```bash
npm run build
```

**本機檢視建置結果**:

```bash
npm run preview
```

**上線**:`npm run build` 會輸出純靜態檔案到 `dist/`,可部署到任何靜態主機。若用 Vercel / Netlify,把 GitHub repo 連過去,設定 build command `npm run build`、output 目錄 `dist`,推上 `main` 分支即可自動部署。
