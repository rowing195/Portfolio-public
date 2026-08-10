/* ── 環境塵光粒子(canvas 版) ──────────────────────────────
   2026-07-11 取代原 book.js 內 18 顆 DOM .mote:每顆 .mote 掛 blur filter
   會各佔一個合成層,行動裝置上成本不低;改為單一 canvas 每幀重繪,
   可負擔更多粒子與更豐富的行為——景深(遠小近大)、正弦搖曳、明滅
   呼吸、以及偶發的暖橘「餘燼」粒子。貼圖預先渲染,每幀僅 drawImage。
   【2026-07-28 經使用者要求】原本 prefers-reduced-motion 時完全不啟動,
   已取消該判斷 —— 一律播放,理由見 book.css 同日註解。 */
(function(){
  'use strict';
  /* 手機版全關:不建 canvas、不跑迴圈(載入時判斷一次,跨斷點縮放需重新整理)
     【2026-07-28】條件須與 book.js 的 MQ_SINGLE、book.css 的 @media 逐字相同,
     理由(為何加 pointer:coarse)見 book.js 同日註解。原本只看寬度,
     高 DPI 縮放的桌機會被誤判成手機而整片塵光消失。 */
  if(matchMedia('(max-width: 720px) and (pointer: coarse)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'ambient-canvas';
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* 兩種預渲染貼圖:金色塵光 / 暖橘餘燼 */
  function makeSprite(inner, mid){
    const s = document.createElement('canvas');
    s.width = s.height = 32;
    const g = s.getContext('2d');
    const rg = g.createRadialGradient(16,16,0,16,16,16);
    rg.addColorStop(0, inner);
    rg.addColorStop(.4, mid);
    rg.addColorStop(1, 'rgba(255,180,90,0)');
    g.fillStyle = rg; g.fillRect(0,0,32,32);
    return s;
  }
  const dust  = makeSprite('rgba(255,236,180,1)',  'rgba(255,214,140,.45)');
  const ember = makeSprite('rgba(255,190,120,1)',  'rgba(255,120,40,.5)');

  let W = 0, H = 0;
  function resize(){
    W = innerWidth; H = innerHeight;
    canvas.width = W*DPR; canvas.height = H*DPR;
  }
  resize();
  addEventListener('resize', resize);

  const N = 32;
  const ps = [];
  function reset(p, first){
    p.z    = .35 + Math.random()*.65;           /* 景深:遠小近大、遠慢近快 */
    p.x    = Math.random()*W;
    p.y    = first ? Math.random()*H : H + 20;
    p.vy   = (14 + Math.random()*16) * p.z;     /* px/s 上飄:近景飄完書高約 23~50s */
    p.sway = 14 + Math.random()*22;             /* 搖曳幅度 */
    p.sf   = .15 + Math.random()*.3;            /* 搖曳頻率 */
    p.tf   = .08 + Math.random()*.17;           /* 明滅頻率:4~12s 緩慢呼吸 */
    p.ph   = Math.random()*Math.PI*2;
    p.r    = (1.6 + Math.random()*2.6) * p.z;
    p.a    = .28 + .45*p.z;
    return p;
  }
  /* 餘燼身分建立時固定指派(約 3 成:桌面 ~10 顆、手機 ~5 顆),
     回收後不重抽,數量恆定不飄忽 */
  for(let i=0;i<N;i++){
    const p = reset({}, true);
    p.ember = i < Math.round(N*.3);
    ps.push(p);
  }
  /* 【2026-08-10】洗牌後才逐一亮相,避免前 30% 名額固定是餘燼、
     導致「先冒出來的全是餘燼、後面才輪到塵光」的不自然順序 */
  for(let i=ps.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [ps[i], ps[j]] = [ps[j], ps[i]];
  }

  /* 【2026-08-10 經使用者要求】不要整批同時出現:從 1 顆開始,RAMP 秒內
     線性增加到滿額 N 顆,比起單純淡入,逐顆冒出來的節奏更接近自然飄浮。 */
  const RAMP = 5;
  let rampStart = null;

  let last = null;
  function tick(ts){
    if(last === null) last = ts;
    const dt = Math.min((ts-last)/1000, .05);
    last = ts;
    const t = ts/1000;

    if(rampStart === null) rampStart = ts;
    const elapsed = (ts - rampStart)/1000;
    const active = Math.min(N, 1 + Math.floor((elapsed/RAMP) * (N-1)));

    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';

    for(let i=0;i<active;i++){
      const p = ps[i];
      p.y -= p.vy*dt;
      if(p.y < -20) reset(p, false);
      const x = p.x + Math.sin(t*p.sf + p.ph)*p.sway*p.z;
      /* 明滅呼吸:下限 .44,永不完全隱形,粒子全程可見直到飄出畫面 */
      const tw = .72 + .28*Math.sin(t*p.tf*Math.PI*2 + p.ph);
      ctx.globalAlpha = p.a * tw * (p.ember ? .85 : 1);
      const r = p.r * (p.ember ? 1.05 : 1);
      ctx.drawImage(p.ember ? ember : dust, x-r*2, p.y-r*2, r*4, r*4);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);   /* 分頁隱藏時 rAF 自動暫停 */
  }

  /* 【2026-08-10 經使用者要求】首訪開場期間(quill-intro.js + burn-intro.js)
     三個 canvas rAF 迴圈同時搶影格預算,較弱顯卡上會卡頓。判斷條件與
     book.js 的開場判斷逐字相同(book.js 尚未執行到寫入 codex-visited,
     此時讀到的還是舊值),塵光延後到開場結束 + 1s 才開始畫、再花 RAMP 秒
     長到滿額;非首訪 / 手機 / 開場已跳過的情況維持原本立即啟動(仍會逐顆長出)。 */
  let introPlaying = false;
  try{ introPlaying = !localStorage.getItem('codex-visited'); }
  catch(e){ introPlaying = true; }
  if(location.hash === '#burn') introPlaying = true;

  if(introPlaying){
    const bEnd = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--b-end')) || 6.6;
    setTimeout(() => requestAnimationFrame(tick), (bEnd + 1) * 1000);
  } else {
    requestAnimationFrame(tick);
  }
})();
