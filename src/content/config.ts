import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** software / papers 共用的條目 schema */
const entrySchema = z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  link: z.string().optional(),
  linkLabel: z.string().optional(),
  order: z.number(),
  /** 佔位條目:只出現在列表(.entry.static),不產生摘要跨頁 */
  placeholder: z.boolean().default(false),
  /** 摘要左頁 eyebrow(預設「Project · {title}」/「Paper · 摘要」) */
  eyebrow: z.string().optional(),
  /** 摘要左頁 h2 標題(預設 title) */
  pageTitle: z.string().optional(),
});

const software = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/software' }),
  schema: entrySchema,
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: entrySchema,
});

export const collections = { software, papers };

/* ── 以下 schema 供 index.astro 讀入 yaml 後驗證 ── */

export const siteSchema = z.object({
  bookTitle: z.string(),
  bookTitleLatin: z.string(),
  author: z.string(),
  intro: z.object({ quote: z.string(), text: z.string() }),
  epilogue: z.string(),
  chapters: z.array(
    z.object({
      id: z.enum(['software', 'papers', 'experience']),
      no: z.string(),
      name: z.string(),
      desc: z.string(),
      ornament: z.string(),
      tagline: z.string(),
      listEyebrow: z.string(),
    })
  ),
});

/** 學歷與經歷共用同一條時間軸:kind 決定軸上標記樣式,points 為選填細項 */
export const timelineSchema = z.array(
  z.object({
    kind: z.enum(['work', 'edu']),
    when: z.string(),
    role: z.string(),
    org: z.string(),
    points: z.array(z.string()).default([]),
  })
);
