(function(){
  const book = document.getElementById('book');
  const tpl  = document.getElementById('tpl-pages');
  const srcPages = [...tpl.content.querySelectorAll('section')];
  /* 【2026-07-28 誤判修復】單頁模式的判定條件。
     原本只看 `(max-width: 720px)`,但那是 CSS 像素 —— Windows 顯示縮放
     150%/175%、瀏覽器分頁縮放(Chrome 依網域永久記住)、視窗沒最大化或
     分割畫面,任一項都能把桌機壓到 720 以下。實例:1366×768 筆電 @175%
     縮放 = 780px,再按一次 Ctrl+「+」就掉進單頁模式。
     而單頁模式對滑鼠使用者是死路:build() 不產生左右熱區(見下方),
     翻頁改綁 touchstart/touchmove/touchend,滑鼠不會產生 touch 事件
     ⇒ 開卷後只剩鍵盤方向鍵與目錄連結能動,使用者感受是「書按不動」。
     加上 `(pointer: coarse)` 後,單頁模式 ⇔ 觸控裝置,滑動翻頁必定可用。
     視窗窄的桌機改為維持雙頁版:版面全部以 vw/vh 計算,會等比縮小而非
     破版,字雖小但所有互動(熱區、點擊、hover)都正常。

     ⚠ 此條件在三個檔案必須逐字相同,任一處不同步就會錯位:
        本檔、ambient.js、book.css 的 @media。 */
  const MQ_SINGLE = '(max-width: 720px) and (pointer: coarse)';
  const mqMobile = matchMedia(MQ_SINGLE);
  let mode, SHEETS, sheets = [], f = 0, busy = false, pending = 0;
  let zonePrev, zoneNext, thumb;

  /* 【2026-07-20 破圖修復】翻頁時序集中管理(ms)。
     以前這些數字散在 CSS(--flip-dur)與 JS(await wait 的字面值)兩處,
     兩邊對不上就會出現「動畫還在跑就 settle()」的破圖,見 goTo()。 */
  const T = {
    spread: { full: 950, step: 350, gap: 140 },
    single: { full: 750, step: 350, gap:  90 },
  };
  const tm = () => T[mode];

  /* ── 建立整本書(依模式) ── */
  function build(){
    mode = mqMobile.matches ? 'single' : 'spread';
    document.body.classList.toggle('mode-single', mode === 'single');
    book.querySelectorAll('.sheet, .flip-zone').forEach(el => el.remove());
    sheets = [];
    if(mode === 'spread'){                       /* 桌面:一張紙 = 正反兩頁 */
      SHEETS = Math.ceil(srcPages.length / 2);
      for(let i=0;i<SHEETS;i++){
        const sheet = el('div','sheet');
        sheet.append(makeFace(srcPages[2*i],'front'), makeFace(srcPages[2*i+1],'back'));
        book.append(sheet); sheets.push(sheet);
      }
    }else{                                        /* 手機:一張紙 = 單頁 */
      SHEETS = srcPages.length;
      for(let i=0;i<SHEETS;i++){
        const sheet = el('div','sheet');
        sheet.append(makeFace(srcPages[i],'front'));
        book.append(sheet); sheets.push(sheet);
      }
    }
    /* 【2026-07-21 經使用者要求】手機不再有左右翻頁熱區,一律用滑動翻頁。
       原因:右熱區和頁內捲動的拉動區搶同一塊,想捲文字常常變成翻頁。
       連 ❮ ❯ 箭頭一起拿掉 —— 留著一個看起來像按鈕卻按不動的箭頭,
       比完全不畫更容易誤導。桌面沿用熱區(滑鼠沒有滑動手勢)。 */
    zonePrev = zoneNext = null;
    if(mode !== 'single'){
      zonePrev = makeZone('prev','❮');
      zoneNext = makeZone('next','❯');
    }
    settle();
  }
  function el(tag, cls){ const d = document.createElement(tag); d.className = cls; return d; }
  function makeFace(src, side){
    const face = el('div','face ' + side);
    if(!src) return face;                         /* 空白反面 */
    face.append(...src.cloneNode(true).childNodes);
    if(src.hasAttribute('data-cover')) face.classList.add('cover');
    if(src.hasAttribute('data-toc-btn')){
      const b = el('button','toc-btn');
      /* 【遷移唯一修改】目錄頁碼原寫死為 gotoSingle='2'(goto='1' 為其跨頁號),
         改由建置時輸出在 <template id="tpl-pages" data-toc-page="N"> 的屬性讀入,
         目錄頁碼因內容擴充改變時自動跟隨,無需再改此檔。 */
      const tocPage = +(tpl.dataset.tocPage || 2);
      b.textContent = '⌂ 目錄';
      b.dataset.goto = String(Math.ceil(tocPage / 2));
      b.dataset.gotoSingle = String(tocPage);
      face.prepend(b);
    }
    return face;
  }
  function makeZone(kind, glyph){
    const z = el('div','flip-zone ' + kind);
    z.innerHTML = '<span class="fz-arrow">' + glyph + '</span>';
    z.addEventListener('click', e=>{
      e.stopPropagation();
      /* 【2026-07-20】相對翻頁以 pending(佇列目標)為基準,不是當下的 f。
         用 f 的話,動畫途中的連點會全部指向同一頁 ⇒ 連按 8 下只前進 1~2 頁。 */
      step(kind==='next' ? 1 : -1);
    });
    book.append(z);
    return z;
  }
  /* data-goto 一律以「跨頁編號」書寫;單頁模式換算成頁碼(章節左頁) */
  const navTarget = n => (mode==='single' && n>0) ? 2*n-1 : n;
  const fmax = () => (mode==='single' ? SHEETS - 1 : SHEETS);

  /* ── 翻走的頁「退場」(.spent) ─────────────────
     【2026-07-20 破圖修復】原本靠 CSS 的
       .mode-single .sheet.flipped{visibility:hidden; transition:… visibility 0s var(--flip-dur)}
     來隱藏翻走的頁,但 goTo() 連翻時會用行內 transition-duration 覆寫時長,
     delay 卻仍鎖在 --flip-dur(.95s),且 visibility 從 visible 起跳時整段
     transition 都維持 visible ⇒ 中間張 .35s 就轉完、要到 1.3s 才隱藏。
     單頁模式的 sheet 沒有背面(makeFace 只做 front),轉過 90° 後整張是
     透明的,卻仍以 z-index 300+ 蓋在最上層 ⇒ 一次疊十來張透明破洞,
     於是看到後面好幾頁的內容。改由 JS 在轉過 90° 時明確標記 .spent。 */
  const spentTimer = new WeakMap();
  function scheduleSpent(s, dur){
    clearTimeout(spentTimer.get(s));
    spentTimer.set(s, setTimeout(() => {
      if(s.classList.contains('flipped')) s.classList.add('spent');
    }, dur * 0.55));                     /* 過半即背面朝外,提早隱藏看不出來 */
  }
  function unspend(s){ clearTimeout(spentTimer.get(s)); s.classList.remove('spent'); }

  /* ── z-index 與狀態(只在所有動畫結束後呼叫) ── */
  function settle(){
    sheets.forEach((s,i)=>{
      const flipped = i < f;
      s.classList.toggle('flipped', flipped);
      s.classList.remove('flying');
      unspend(s);
      /* 【2026-07-21 兩頁疊印修復】單頁模式一次只看得到一張,除了當前這張全部收起。
         原本只收「已翻過去」的頁,其餘十幾張未翻的頁全都留在畫面上,單純靠
         z-index + 不透明背景互相遮蔽。但 .mode-single .sheet 有
         backface-visibility:hidden,每張都會被提升成獨立合成層 —— 真機上
         十幾層的實際疊放順序一旦沒照 z-index 走,就會出現兩頁內容同時畫出來
         (iPhone 17 Pro 與 S25 Ultra 皆可重現)。
         只留一張可見,這種疊印就結構上不可能發生,順帶把合成層從 15 降到 1。 */
      if(mode === 'single' ? (i !== f) : flipped) s.classList.add('spent');
      s.style.zIndex = flipped ? i+1 : SHEETS - i;
      s.style.removeProperty('--fd');    /* 清除跳轉時的行內加速(見 goTo) */
      s.style.willChange = '';           /* 只在飛行中提層,避免手機同時 20 層爆 GPU */
    });
    book.classList.toggle('open', f > 0);
    if(zonePrev) zonePrev.hidden = (f === 0);          /* 手機沒有熱區,故需判空 */
    if(zoneNext) zoneNext.hidden = (f === 0 || f >= fmax());
  }

  /* ── 翻到指定 sheet 數(可連續翻) ──
     【2026-07-20】改為「目標佇列」:動畫途中的點擊不再被 busy 丟掉,
     而是更新 pending 讓執行中的迴圈接手 —— 原本手機上連點會整個沒反應。 */
  async function goTo(target){
    pending = Math.max(0, Math.min(fmax(), target));
    if(busy) return;
    busy = true;
    hideThumb();                         /* 翻頁時捲軸先退場,別跟著書頁一起轉 */
    /* 【2026-07-20】try/finally 保險:迴圈裡只要拋一次例外,busy 就會永遠卡在
       true,之後所有翻頁靜默失效 —— 症狀正是「卡死、翻不動」。
       無論如何都要把 busy 放掉,寧可畫面錯一次也不要整本書鎖死。 */
    try{
      while(f !== pending){
        const dir = pending > f ? 1 : -1;
        const idx = dir===1 ? f : f-1;
        const s = sheets[idx];
        /* 【2026-07-11 經使用者要求】多頁跳轉 riffle 化:中間張縮短時長並密集
           下一張,末張以完整時長收尾(快速逐頁撥書感)。
           【2026-07-20】時長改寫進 --fd(CSS 用 var(--fd, --flip-dur) 吃),
           並且「等待時間 = 動畫時長」,確保 settle() 不會在動畫中途就把
           z-index 打回去(舊版末張動畫 .95s 卻只等 750ms,翻到一半會突然沉底消失)。 */
        const last = (f + dir === pending);
        const dur = last ? tm().full : tm().step;
        s.style.setProperty('--fd', dur + 'ms');
        s.style.willChange = 'transform';
        s.classList.add('flying');           /* 飛行中收掉捲動層,見 book.css */
        s.style.zIndex = 300 + (dir===1 ? idx : SHEETS-idx);
        if(dir===1){ s.classList.add('flipped'); scheduleSpent(s, dur); }
        else       { unspend(s); s.classList.remove('flipped'); }
        f += dir;
        unspend(sheets[f]);   /* 新的當前頁必須可見(前翻時它原本是收起來的) */
        book.classList.toggle('open', f > 0);
        await wait(last ? dur : tm().gap);
      }
    } finally {
      /* 順序要緊:busy 必須先放掉。settle() 自己也可能拋(它會碰每一張 sheet
         的 style),若寫成 settle(); busy=false; 一旦 settle 拋了就同樣鎖死。
         settle() 是同步的,中間不會有別的程式插進來,所以先放 busy 沒有重入風險。 */
      busy = false;
      settle();
    }
  }
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  /* 相對翻頁:以佇列目標為基準累加,連點才會逐頁累積 */
  const step = d => goTo((busy ? pending : f) + d);

  /* ── 事件 ── */
  book.addEventListener('click', e=>{
    const nav = e.target.closest('[data-goto]');
    if(nav){
      e.stopPropagation();
      const t = (mode==='single' && nav.dataset.gotoSingle)
        ? +nav.dataset.gotoSingle
        : navTarget(+nav.dataset.goto);
      goTo(t); return;
    }
    const link = e.target.closest('[data-href]');
    if(link){
      e.stopPropagation();
      /* 【2026-07-13 經使用者要求】移除外連前「多翻一頁再翻回」的動作:
         新分頁開啟時機不定,常在翻頁動畫結束後才跳轉,觀感不佳,
         故改為停留原頁直接開啟連結。 */
      window.open(link.dataset.href,'_blank');
      return;
    }
    if(f===0 && e.target.closest('.cover')) goTo(1);
  });
  addEventListener('keydown', e=>{
    if(e.key==='ArrowRight') step(1);
    if(e.key==='ArrowLeft')  step(-1);
  });

  /* ── 【2026-07-20】手機滑動翻頁(手勢觸發) ────────────────
     以前手機只能點左右熱區,而右熱區又和頁內捲動的拉動區疊在一起。
     改為左右滑動翻頁:起手方向決定這一次手勢歸誰 —— 偏水平吃翻頁、
     偏垂直交還給頁內捲動。水平方向已由 CSS `touch-action:pan-y pinch-zoom`
     從瀏覽器手上收回,所以這裡不需要 preventDefault,也就不會有
     「已經開始捲動才想攔截」的 non-cancelable 問題。 */
  const SWIPE = {
    dist: 60,    /* 一般滑動的位移門檻 px */
    flick: 25,   /* 快速輕掃的位移門檻 px */
    time: 300,   /* 判定為輕掃的時間上限 ms */
    lock: 8,     /* 超過這個位移才判定方向 */
    slope: 1.2,  /* |dx| 需大於 |dy| 的倍數,偏一點點不算水平 */
  };
  let sx=0, sy=0, st=0, axis=null, tracking=false, swiped=false;

  book.addEventListener('touchstart', e=>{
    if(mode !== 'single' || e.touches.length !== 1) { tracking = false; return; }
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY; st = Date.now();
    axis = null; tracking = true;
  }, {passive:true});

  book.addEventListener('touchmove', e=>{
    if(!tracking || e.touches.length !== 1) return;
    const t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if(axis === null && (Math.abs(dx) > SWIPE.lock || Math.abs(dy) > SWIPE.lock))
      axis = Math.abs(dx) > Math.abs(dy) * SWIPE.slope ? 'x' : 'y';
  }, {passive:true});

  book.addEventListener('touchend', e=>{
    if(!tracking) return;
    tracking = false;
    if(axis !== 'x') return;
    const dx = e.changedTouches[0].clientX - sx;
    const quick = (Date.now() - st) < SWIPE.time && Math.abs(dx) > SWIPE.flick;
    if(Math.abs(dx) < SWIPE.dist && !quick) return;
    /* 滑動已消費掉這次觸控:壓下隨後補發的 click,
       否則從目錄項起手往左滑會「翻頁 + 又跳章」各做一次 */
    swiped = true;
    setTimeout(()=>{ swiped = false; }, 400);
    hideThumb();
    step(dx < 0 ? 1 : -1);          /* 左滑 → 下一頁,右滑 → 上一頁 */
  }, {passive:true});

  /* 【2026-07-20】touchcancel:系統手勢介入(iOS 左緣返回、通知列下拉、
     多指觸控…)時瀏覽器只發 touchcancel、不發 touchend。原本沒接這個事件,
     手勢會靜靜消失 —— 使用者看到的就是「滑了沒反應」。 */
  book.addEventListener('touchcancel', ()=>{ tracking = false; axis = null; }, {passive:true});

  book.addEventListener('click', e=>{
    if(swiped){ e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* ── 【2026-07-20】燙金細捲軸 ────────────────────────────
     單頁模式把原生捲軸關掉自繪:iOS 的 overlay 捲軸幾乎不吃
     ::-webkit-scrollbar 樣式,自繪才能兩邊長得一樣、也才做得出淡出。
     scroll 事件不冒泡,所以用捕獲階段接。 */
  let thumbTimer;
  function hideThumb(){ if(thumb) thumb.classList.remove('on'); }
  function updateThumb(face){
    const max = face.scrollHeight - face.clientHeight;
    if(max <= 1) return;
    if(!thumb){                                  /* 掛在 body,避開 .book 的 3D 排序 */
      thumb = el('div','scroll-thumb');
      document.body.append(thumb);
    }
    const r = face.getBoundingClientRect();       /* 未翻轉時即該頁的實際位置 */
    const h = Math.max(28, r.height * face.clientHeight / face.scrollHeight);
    const y = r.top + (r.height - h) * (face.scrollTop / max);
    thumb.style.height = h + 'px';
    thumb.style.top  = y + 'px';
    thumb.style.left = (r.right - 8) + 'px';
    thumb.classList.add('on');
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(hideThumb, 700);   /* 停手後淡出 */
  }
  book.addEventListener('scroll', e=>{
    if(mode !== 'single') return;
    const face = e.target.closest && e.target.closest('.face');
    if(face) updateThumb(face);
  }, true);

  /* ── 塵光粒子 ── */
  /* 【2026-07-11 canvas 化】原 18 顆 DOM .mote(每顆 blur filter 各佔一合成層)
     改由 ambient.js 的單一 canvas 繪製(景深/搖曳/明滅/餘燼),
     於本檔之前載入並自行啟動,此處不再生成 DOM 粒子。 */

  build();

  /* ── 跨越斷點時重建(桌面↔手機),並保留目前閱讀位置 ── */
  mqMobile.addEventListener('change', ()=>{
    const page = (mode === 'spread') ? f * 2 : f;   /* 目前所在頁碼 */
    busy = false;
    build();                                         /* mode 已更新 */
    f = (mode === 'single') ? Math.min(page, SHEETS)
                            : Math.min(Math.ceil(page / 2), SHEETS);
    pending = f;
    settle();
  });

  /* ── 首次造訪:燙金燃燒開場 ── */
  /* 【2026-07 canvas 化】火線/光暈/火花改由 canvas 繪製(burn-intro.js,
     於本檔之前載入),此處只負責首訪判斷與啟動;原 DOM 火花生成器移除。 */
  (function(){
    let first = true;
    try{
      first = !localStorage.getItem('codex-visited');
      localStorage.setItem('codex-visited','1');
    }catch(e){ /* 預覽環境無 localStorage:每次都播放 */ }
    if(location.hash === '#burn') first = true;           // 強制重播後門
    if(!first) return;
    /* 【2026-07-28 經使用者要求】原本 prefers-reduced-motion 時跳過開場,
       已取消 —— 一律播放,理由見 book.css 同日註解。開場是本站動態幅度
       最大的一段,若日後要恢復尊重此偏好,這一行是第一個該加回來的。 */
    /* 【2026-07-11】手機版整個不播開場(含 #burn 後門):不加 .igniting、
       不呼叫 canvas,封面直接以完成態顯示 */
    if(mqMobile.matches) return;

    const cover = document.querySelector('.face.cover');
    if(!cover) return;
    cover.classList.add('igniting');
    /* 【2026-07-29】開場分兩段:羽毛筆寫字(quill-intro.js)→ 點火燙金
       (burn-intro.js)。兩者同一幀啟動、各自以 CSS 的 :root 時間軸排程,
       所以這裡的呼叫順序不影響時序,只決定 canvas 的疊放先後。 */
    if(window.__quillIntro) window.__quillIntro(cover);
    if(window.__burnIntro) window.__burnIntro(cover);
  })();
})();
