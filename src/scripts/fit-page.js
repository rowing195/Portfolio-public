/* ═══════════════════════════════════════════════════════════════
   fit-page.js — 摘要頁內文自動縮字(2026-07-13)
   .face 為固定高度且 overflow:hidden,內文(.readme)過長時會被
   直接裁掉、貼到頁底。此腳本在排版後逐頁量測:內容超出頁面時
   小步調降該頁 .readme 字級(下限 0.78em),直到連同頁碼列一起
   放得下為止,保證底部留白且不裁字。
   手機單頁模式(.mode-single)頁內可捲動,不需要也不套用縮字。
   於 book.js 之後載入(此時 build() 已完成、.face 已生成)。
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const MIN = 0.78;   /* 字級下限(em),再小就犧牲可讀性 */
  const STEP = 0.02;

  const fit = () => {
    const single = document.body.classList.contains('mode-single');
    document.querySelectorAll('#book .face').forEach((face) => {
      const rd = face.querySelector('.readme');
      if (rd) rd.style.fontSize = '';       /* 還原後重新量測(含放大視窗時回彈) */
      if (single) {
        /* 【2026-07-20】單頁模式不縮字(可捲動),但只有「真的放不下」的頁
           才升級成捲動容器。原本 20 頁全掛 overflow-y:auto,等於 20 個
           可捲動合成層,行動裝置翻頁時會出現只畫一半/整頁空白。
           實測 20 頁裡只有 3 頁會溢出。 */
        face.classList.toggle('scrollable', face.scrollHeight - face.clientHeight > 1);
        return;
      }
      face.classList.remove('scrollable');
      if (!rd) return;
      let s = 1;
      while (face.scrollHeight - face.clientHeight > 1 && s > MIN) {
        s -= STEP;
        rd.style.fontSize = s + 'em';
      }
    });
  };

  /* build() 在 book.js 同步完成,可立即首量;webfont 載入後字寬
     會變,需再量一次;視窗尺寸改變(含跨斷點重建 .face)後亦然。 */
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fit, 150); });
})();
