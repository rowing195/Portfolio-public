/* ── 開場:羽毛筆書寫封面文字(canvas 版) ─────────────────────────
   2026-07-29 依需求把封面三行文字的揭示方式從「火焰整行橫掃」改成
   「羽毛筆逐字寫出」。分工刻意與既有的 burn-intro.js 一致:

     · 文字本身由 CSS 逐字遮罩揭示(book.css 的 qWrite)—— 中文字形交給
       瀏覽器排版就好,讓 canvas 去描 5 個繁體字的筆畫需要數百 KB 的筆順
       資料,字形還會和 Noto Serif TC 不合、金箔漸層也套不上去。
     · 本檔只負責畫那支筆:筆桿與羽片預先渲染成一張貼圖,每幀只做
       translate + rotate + drawImage 一次,外加筆尖的濕墨反光與少量墨屑。
       整段開場因此只多一個繪製物件,行動裝置上的成本可以忽略
       (何況手機版完全不播開場,見 book.js)。
     · 寫完後交棒給 burn-intro.js:火線掃過封面,墨跡燙成金箔。

   ⚠ 時間軸的唯一來源是 book.css 的 :root --q-* 自訂屬性,本檔以
     getComputedStyle 讀取同一批值。那些值必須以秒書寫(.35s,不可寫
     350ms),parseFloat 才讀得到。
   ⚠ 筆尖的 x 是從 CSS 遮罩的幾何反推出來的(見 EDGE_A/EDGE_B),
     改動 book.css 的 mask-size / mask-position / 漸層中點時必須一起改,
     否則筆尖會離開墨跡邊緣、看起來像筆沒沾到紙。

   由 book.js 的開場程式呼叫 window.__quillIntro(coverEl)。 */
(function () {
  'use strict';

  /* 墨跡邊緣在字寬中的位置 = EDGE_A + EDGE_B * p(p 為該字的書寫進度)。
     book.css:mask-size 200%、漸層中點約 61%、mask-position 132% → 0%
     ⇒ 邊緣自 -.1w 掃到 1.22w。字的墨只占字框前約 76%(其餘是 letter-spacing
     的尾隙),故筆尖在後段是在字距間移動 —— 正好停在下一個字的起點上,
     字與字之間不會有回頭的跳動。 */
  const EDGE_A = -0.1,
    EDGE_B = 1.32;

  /* 筆的傾角(rad):約 41°。刻意偏斜而非接近垂直 —— 直立時羽片會壓在
     正上方,寫中間那行時整片羽毛蓋住剛寫完的拉丁文;斜到 40° 以上,
     羽片掃過的是右上方「還沒寫到」的空白區,遮擋就不礙事了。 */
  const LEAN = 0.72;
  const ease = (t) => t * t * (3 - 2 * t);
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

  /* 濕墨反光貼圖:剛落下的墨還沒乾,會把燭光反成一小點暖白 */
  const wet = document.createElement('canvas');
  wet.width = wet.height = 32;
  (function () {
    const g = wet.getContext('2d');
    const rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, 'rgba(255,241,209,.9)');
    rg.addColorStop(0.42, 'rgba(232,201,138,.3)');
    rg.addColorStop(1, 'rgba(201,164,92,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 32, 32);
  })();

  /* 羽毛筆貼圖:筆尖固定在 (nx, ny),筆身朝正上方,使用時再整支旋轉 LEAN。
     只在 measure() 時依封面大小重建一次,不是每幀重畫。 */
  function buildQuill(L) {
    const PAD = Math.ceil(L * 0.1) + 6;
    const c = document.createElement('canvas');
    c.width = Math.ceil(L * 0.5) + PAD * 2;
    c.height = Math.ceil(L) + PAD * 2;
    const g = c.getContext('2d');
    const nx = PAD + L * 0.08,
      ny = c.height - PAD; /* 筆尖 */
    const tipX = nx + L * 0.24,
      tipY = PAD; /* 羽毛頂端 */
    const bend = L * 0.055; /* 筆桿的弧度 */

    /* 沿筆桿的參數座標(t:0 筆尖 → 1 頂端)與該處的法線方向 */
    const at = (t) => [
      nx + (tipX - nx) * t + Math.sin(t * Math.PI) * bend,
      ny + (tipY - ny) * t,
    ];
    const dx = tipX - nx,
      dy = tipY - ny,
      dl = Math.hypot(dx, dy);
    const nrm = [-dy / dl, dx / dl];

    /* 羽片:自 t=.28 起的兩片梭形,中段最寬、兩端收尖。
       左右不等寬 —— 真羽毛的羽軸偏一側,對稱會像葉子而不像羽毛。 */
    const VANE_FROM = 0.28,
      VANE_TO = 0.98;
    const width = (t) => {
      const u = clamp01((t - VANE_FROM) / (VANE_TO - VANE_FROM));
      return L * 0.115 * Math.sin(Math.PI * Math.pow(u, 0.8));
    };
    for (const side of [1, -1]) {
      const k = side > 0 ? 1 : 0.66;
      g.beginPath();
      for (let i = 0; i <= 24; i++) {
        const t = VANE_FROM + ((VANE_TO - VANE_FROM) * i) / 24;
        const p = at(t),
          w = width(t) * k;
        const x = p[0] + nrm[0] * w * side,
          y = p[1] + nrm[1] * w * side;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      for (let i = 24; i >= 0; i--) {
        const p = at(VANE_FROM + ((VANE_TO - VANE_FROM) * i) / 24);
        g.lineTo(p[0], p[1]);
      }
      g.closePath();
      const lg = g.createLinearGradient(nx, ny, tipX, tipY);
      lg.addColorStop(0, 'rgba(214,196,158,.10)');
      lg.addColorStop(0.45, 'rgba(240,229,201,.30)');
      lg.addColorStop(1, 'rgba(201,164,92,.10)');
      g.fillStyle = lg;
      g.fill();
    }
    /* 羽枝:自羽軸向外的短斜線,給羽片一點紋理 */
    g.strokeStyle = 'rgba(248,240,218,.17)';
    g.lineWidth = Math.max(0.7, L * 0.005);
    for (let i = 0; i <= 22; i++) {
      const t = VANE_FROM + ((VANE_TO - VANE_FROM) * i) / 22;
      const p = at(t),
        w = width(t);
      for (const side of [1, -1]) {
        const k = side > 0 ? 1 : 0.66;
        const back = at(Math.max(VANE_FROM, t - 0.06));
        g.beginPath();
        g.moveTo(p[0], p[1]);
        g.lineTo(back[0] + nrm[0] * w * k * side, back[1] + nrm[1] * w * k * side);
        g.stroke();
      }
    }
    /* 羽軸 + 筆桿:上段亮、下段(沾墨的桿)偏深 */
    const shaft = g.createLinearGradient(nx, ny, tipX, tipY);
    shaft.addColorStop(0, 'rgba(150,116,68,.85)');
    shaft.addColorStop(0.3, 'rgba(246,235,208,.8)');
    shaft.addColorStop(1, 'rgba(246,235,208,.5)');
    g.strokeStyle = shaft;
    g.lineWidth = Math.max(1.5, L * 0.013);
    g.lineCap = 'round';
    g.beginPath();
    for (let i = 0; i <= 24; i++) {
      const p = at(i / 24);
      i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]);
    }
    g.stroke();
    /* 筆尖:削尖的鵝毛管,一小片深色三角 + 一道高光 */
    const tipLen = L * 0.075,
      tp = at(tipLen / dl);
    g.beginPath();
    g.moveTo(nx, ny);
    g.lineTo(tp[0] + nrm[0] * L * 0.014, tp[1] + nrm[1] * L * 0.014);
    g.lineTo(tp[0] - nrm[0] * L * 0.014, tp[1] - nrm[1] * L * 0.014);
    g.closePath();
    g.fillStyle = 'rgba(28,17,8,.92)';
    g.fill();
    g.strokeStyle = 'rgba(255,244,216,.5)';
    g.lineWidth = Math.max(0.8, L * 0.005);
    g.beginPath();
    g.moveTo(nx, ny);
    g.lineTo(tp[0], tp[1]);
    g.stroke();

    return { img: c, nx: nx, ny: ny };
  }

  window.__quillIntro = function (cover) {
    const cs = getComputedStyle(document.documentElement);
    const V = (n) => parseFloat(cs.getPropertyValue(n)) || 0;
    const IN = V('--q-in'),
      OUT = V('--q-out'),
      OUT_DUR = V('--q-out-dur');
    const END = OUT + OUT_DUR + 0.9; /* 多留 .9s 讓最後的墨屑淡完 */

    /* 每行的筆勢參數:
         wig  每個字的筆尖上下擺動次數。漢字筆畫多,擺三次才有「一筆一畫」的
              節奏;拉丁小字擺一次就好,擺多了像抖手。
         base 筆尖在字框內的起始高度(字框高的比例)
         dip  一個字之內筆尖下行的幅度
       dip 必須跟著書寫速度走:每寫完一個字,筆尖就從 base+dip 回到下一個字的
       base,這個回彈是每 stride 一次。書名 stride 有 .3s,回彈看起來就是
       「提筆換字」;但拉丁文/作者行 stride 只有 .055~.06s,若沿用同樣的
       dip(.58 字框高 ≈ 17px)就成了 0.7 秒內來回 12 次的鋸齒抖動 ——
       實測畫出軌跡才看得出來,所以小字行改為近乎水平地滑過(dip .18)。 */
    const lines = [
      { el: cover.querySelector('.latin'), at: V('--q-latin-at'), stride: V('--q-latin-stride'),
        wig: 1, base: 0.5, dip: 0.18 },
      { el: cover.querySelector('h1'), at: V('--q-title-at'), stride: V('--q-title-stride'),
        wig: 3, base: 0.22, dip: 0.58 },
      { el: cover.querySelector('.owner'), at: V('--q-owner-at'), stride: V('--q-owner-stride'),
        wig: 1, base: 0.5, dip: 0.18 },
    ].filter((l) => l.el && l.el.querySelector('.g'));
    if (!lines.length) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'quill-canvas';
    cover.append(canvas);
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0,
      H = 0,
      quill = null;
    function measure() {
      W = cover.clientWidth;
      H = cover.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      const c0 = cover.getBoundingClientRect();
      for (const l of lines) {
        l.g = [...l.el.querySelectorAll('.g')].map((el) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left - c0.left,
            y: r.top - c0.top,
            w: r.width,
            h: r.height,
            sp: el.classList.contains('sp'),
          };
        });
        l.end = l.at + l.g.length * l.stride;
      }
      /* 筆長取封面高的 1/4。原本用 .34 畫出來整支筆橫跨大半個封面,
         羽片直接壓掉上下兩行文字 —— 一支「合乎比例」的鵝毛筆在這個尺寸的
         封面上其實相當小。 */
      quill = buildQuill(H * 0.25);
    }
    measure();
    addEventListener('resize', measure);
    /* webfont 載入後字寬會變,量到的字框要重取一次,否則筆尖會離開文字 */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    /* 第 i 個字在進度 f 時的筆尖位置。x 嚴格跟著 CSS 遮罩的墨跡邊緣走,
       y 只在字框內做一段下行 + 擺動 —— 讓「筆尖在哪,墨就長到哪」成立,
       眼睛只要看到這個相關性就會讀成「正在被寫出來」。 */
    function nib(l, i, f) {
      const g = l.g[i];
      const x = g.x + g.w * (EDGE_A + EDGE_B * f);
      let y = g.y + g.h * (l.base + l.dip * f) + Math.sin(f * Math.PI * l.wig) * g.h * 0.12;
      if (g.sp) y -= g.h * 0.4; /* 空白處提筆略過 */
      return [x, y, g];
    }

    /* 筆的狀態機:入場 → 逐行書寫(行間拱形提筆)→ 退場 */
    function pen(now) {
      const first = lines[0],
        last = lines[lines.length - 1];
      if (now < first.at) {
        const p = ease(clamp01((now - (first.at - IN)) / IN));
        const n = nib(first, 0, 0);
        return {
          x: n[0] + W * 0.5 * (1 - p),
          y: n[1] - H * 0.42 * (1 - p),
          a: p,
          lean: LEAN - 0.14 * (1 - p),
          ink: 0,
        };
      }
      for (let k = 0; k < lines.length; k++) {
        const l = lines[k];
        if (now < l.end) {
          const head = (now - l.at) / l.stride;
          const i = Math.min(l.g.length - 1, Math.max(0, Math.floor(head)));
          const f = clamp01(head - i);
          const n = nib(l, i, f);
          /* 下筆處壓得重、收筆放輕:墨暈跟著呼吸,空白處不出墨 */
          return {
            x: n[0],
            y: n[1],
            a: 1,
            lean: LEAN + Math.sin(f * Math.PI * l.wig) * 0.05,
            ink: n[2].sp ? 0 : 0.55 + 0.45 * Math.sin(Math.PI * f),
            size: n[2].h,
          };
        }
        const next = lines[k + 1];
        if (next && now < next.at) {
          const p = clamp01((now - l.end) / (next.at - l.end));
          const s = ease(p);
          const a = nib(l, l.g.length - 1, 1),
            b = nib(next, 0, 0);
          return {
            x: a[0] + (b[0] - a[0]) * s,
            y: a[1] + (b[1] - a[1]) * s - Math.sin(Math.PI * p) * a[2].h * 1.15,
            a: 1,
            lean: LEAN - 0.1 * Math.sin(Math.PI * p),
            ink: 0,
          };
        }
      }
      const p = clamp01((now - OUT) / OUT_DUR);
      const n = nib(last, last.g.length - 1, 1);
      return {
        x: n[0] + W * 0.12 * p,
        y: n[1] - H * 0.24 * p,
        a: 1 - p * p,
        lean: LEAN + 0.3 * p,
        ink: 0,
      };
    }

    /* 墨屑:落筆時偶爾濺出的小點,略往下沉後淡掉 */
    const flecks = [];
    let now = 0,
      start = null,
      lastFleck = 0;

    function tick(ts) {
      if (start === null) start = ts;
      now = (ts - start) / 1000;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const p = pen(now);

      if (p.ink > 0.15 && now - lastFleck > 0.09 && Math.random() < 0.55) {
        lastFleck = now;
        flecks.push({
          x: p.x + Math.random() * 6 - 3,
          y: p.y + Math.random() * 4 - 2,
          dy: 6 + Math.random() * 10,
          dx: Math.random() * 8 - 4,
          r: 0.7 + Math.random() * 1.3,
          born: now,
          life: 0.55 + Math.random() * 0.5,
        });
      }
      for (let i = flecks.length - 1; i >= 0; i--) {
        const s = flecks[i],
          t = (now - s.born) / s.life;
        if (t >= 1) {
          flecks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = (1 - t) * 0.55;
        ctx.fillStyle = '#8a5c26';
        ctx.beginPath();
        ctx.arc(s.x + s.dx * t, s.y + s.dy * t * t, s.r * (1 - 0.3 * t), 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* 筆尖濕墨反光(加色混合,才像光而不像貼一塊白) */
      if (p.ink > 0) {
        const r = (p.size || H * 0.05) * 0.42 * p.ink;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = p.ink * 0.9;
        ctx.drawImage(wet, p.x - r, p.y - r, r * 2, r * 2);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      /* 那支筆 */
      if (p.a > 0 && quill) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.a);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.lean + Math.sin(now * 5.5) * 0.012); /* 極輕微的手部晃動 */
        ctx.drawImage(quill.img, -quill.nx, -quill.ny);
        ctx.restore();
      }

      if (now < END) requestAnimationFrame(tick);
      else {
        removeEventListener('resize', measure);
        canvas.remove();
      }
    }
    requestAnimationFrame(tick);
  };
})();
