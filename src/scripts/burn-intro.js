/* ── 開場燙金燃燒特效(canvas 版) ──────────────────────────────
   2026-07 依需求將原 CSS/SVG 特效改為單一 <canvas> 繪製:
   火線、光暈、火花全部在畫布上以 2D 繪圖完成——原本的 SVG stroke +
   雙層 drop-shadow filter 與高頻 DOM 火花每幀都逼 GPU 重新光柵化,
   在行動裝置上會卡頓破圖;canvas 每幀只重繪一張點陣圖,負擔極低。
   文字仍由 CSS mask 揭示(小面積重繪,便宜),畫布負責掃過時的火光。
   時間軸與原 CSS 動畫逐項對齊(delay / duration / cubic-bezier 皆同)。
   由 book.js 的開場程式呼叫 window.__burnIntro(coverEl)。 */
(function(){
  'use strict';

  /* cubic-bezier 求值(牛頓法),對應原 CSS 緩動曲線 */
  function bezier(x1,y1,x2,y2){
    const cx=3*x1, bx=3*(x2-x1)-cx, ax=1-cx-bx;
    const cy=3*y1, by=3*(y2-y1)-cy, ay=1-cy-by;
    const xAt = t => ((ax*t+bx)*t+cx)*t;
    return function(x){
      if(x<=0) return 0; if(x>=1) return 1;
      let t=x;
      for(let i=0;i<5;i++){
        const dx=xAt(t)-x, d=(3*ax*t+2*bx)*t+cx;
        if(Math.abs(dx)<1e-4 || d===0) break;
        t-=dx/d;
      }
      return ((ay*t+by)*t+cy)*t;
    };
  }
  const easeText  = bezier(.5,.05,.45,.95);   /* 原 @keyframes burnIn */
  const easeTrace = bezier(.4,0,.3,1);        /* 原 @keyframes draw  */

  /* 火花畫成預先渲染的小貼圖,每幀 drawImage 即可,不必重建漸層 */
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  (function(){
    const g = sprite.getContext('2d');
    const rg = g.createRadialGradient(16,16,0,16,16,16);
    rg.addColorStop(0,'rgba(255,210,122,1)');
    rg.addColorStop(.45,'rgba(255,123,46,.55)');
    rg.addColorStop(1,'rgba(255,123,46,0)');
    g.fillStyle = rg; g.fillRect(0,0,32,32);
  })();

  window.__burnIntro = function(cover){
    const canvas = document.createElement('canvas');
    canvas.className = 'burn-canvas';
    cover.append(canvas);
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W=0, H=0, frame=null, texts=[];
    function measure(){
      W = cover.clientWidth; H = cover.clientHeight;
      canvas.width = W*DPR; canvas.height = H*DPR;
      const c0 = cover.getBoundingClientRect();
      const fr = cover.querySelector('.cover-frame').getBoundingClientRect();
      frame = { x:fr.left-c0.left, y:fr.top-c0.top, w:fr.width, h:fr.height };
      texts = [...cover.querySelectorAll('.latin, h1, .owner')].map((el,i)=>{
        const r = el.getBoundingClientRect();
        return { x:r.left-c0.left, y:r.top-c0.top, w:r.width, h:r.height,
                 delay:[.5,.8,1.2][i] };
      });
    }
    measure();
    addEventListener('resize', measure);

    /* 沿框線(順時針,自左上起)取進度 s∈[0,1] 的座標 */
    function onFrame(s){
      const x=frame.x, y=frame.y, w=frame.w, h=frame.h;
      let d = s*2*(w+h);
      if(d < w)         return [x+d,   y    ];
      d -= w; if(d < h) return [x+w,   y+d  ];
      d -= h; if(d < w) return [x+w-d, y+h  ];
      d -= w;           return [x,     y+h-d];
    }

    const sparks = [];
    let now = 0;
    function spawn(px,py){
      sparks.push({ x:px, y:py, dx:Math.random()*44-22, dy:-70, born:now,
                    life:1.4, r:2+Math.random()*2.2 });
    }
    /* 轉角/收尾爆點:放射狀火花 */
    function burst(px,py){
      for(let i=0;i<12;i++){
        sparks.push({ x:px, y:py,
                      dx:Math.random()*130-65, dy:Math.random()*140-115,
                      born:now, life:.7+Math.random()*.6,
                      r:1.6+Math.random()*2 });
      }
    }

    const TEXT_DUR=1.5, TRACE_DELAY=1.1, TRACE_DUR=1.8,
          FADE_START=2.8, FADE_DUR=.7, SPARK_UNTIL=3.5, END=5.0;
    let start=null, lastSpawn=0, lastTraceE=0;

    function tick(ts){
      if(start===null) start=ts;
      now = (ts-start)/1000;
      ctx.setTransform(DPR,0,0,DPR,0,0);
      ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation = 'lighter';

      /* 隨機火花(對應原 90ms 生成;canvas 便宜,120ms 即有相同密度感) */
      if(now < SPARK_UNTIL && now-lastSpawn > .12){
        lastSpawn = now;
        spawn(W*(.08+Math.random()*.84), H*(.1+Math.random()*.8));
      }

      /* 文字掃過的火光帶(位置對齊 CSS mask 的揭示邊緣) */
      for(const t of texts){
        const p = (now-t.delay)/TEXT_DUR;
        if(p<=0 || p>=1) continue;
        const e = easeText(p);
        const ex = t.x + t.w*(2.16*e - .76);
        const a  = Math.sin(Math.PI*e)*.85;
        const bw = Math.max(40, t.w*.3), bh = t.h*1.5;
        ctx.save();
        ctx.translate(ex, t.y+t.h/2); ctx.rotate(.17);
        const g = ctx.createLinearGradient(-bw,0,bw,0);
        g.addColorStop(0,'rgba(255,120,30,0)');
        g.addColorStop(.5,'rgba(255,154,60,'+a.toFixed(3)+')');
        g.addColorStop(1,'rgba(255,120,30,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-bw,-bh/2,bw*2,bh);
        ctx.restore();
        if(Math.random()<.3) spawn(ex-8+Math.random()*16, t.y+Math.random()*t.h);
      }

      /* 邊框火線:三道疊描(細亮線+兩層淡光)取代 drop-shadow filter */
      const tp = (now-TRACE_DELAY)/TRACE_DUR;
      const traceAlpha = now>FADE_START ? Math.max(0,1-(now-FADE_START)/FADE_DUR) : 1;
      if(tp>0 && traceAlpha>0){
        const e = easeTrace(Math.min(tp,1));
        const x=frame.x, y=frame.y, w=frame.w, h=frame.h;
        const dist = e*2*(w+h);
        const corners=[[x+w,y],[x+w,y+h],[x,y+h],[x,y]], lens=[w,h,w,h];
        ctx.beginPath(); ctx.moveTo(x,y);
        let run=0;
        for(let i=0;i<4;i++){
          if(dist >= run+lens[i]){ ctx.lineTo(corners[i][0],corners[i][1]); run+=lens[i]; }
          else{
            const f=(dist-run)/lens[i];
            const px0 = i===0 ? x : corners[i-1][0];
            const py0 = i===0 ? y : corners[i-1][1];
            ctx.lineTo(px0+(corners[i][0]-px0)*f, py0+(corners[i][1]-py0)*f);
            break;
          }
        }
        ctx.lineJoin='round'; ctx.lineCap='round';
        ctx.strokeStyle='rgba(255,110,30,'+(.10*traceAlpha).toFixed(3)+')';
        ctx.lineWidth=13; ctx.stroke();
        ctx.strokeStyle='rgba(255,123,46,'+(.28*traceAlpha).toFixed(3)+')';
        ctx.lineWidth=6;  ctx.stroke();
        ctx.strokeStyle='rgba(255,176,102,'+(.95*traceAlpha).toFixed(3)+')';
        ctx.lineWidth=2;  ctx.stroke();
        /* 火頭光球,沿途撒火花 */
        if(e<1){
          const hp = onFrame(e);
          ctx.globalAlpha = traceAlpha;
          ctx.drawImage(sprite, hp[0]-14, hp[1]-14, 28, 28);
          ctx.globalAlpha = 1;
          if(Math.random()<.5) spawn(hp[0], hp[1]);
        }
        /* 火頭掃過轉角時爆出放射火花;閉環回到起點時收尾總爆點 */
        if(e > lastTraceE){
          const per = 2*(w+h);
          const cornerFr = [[w/per, x+w, y], [(w+h)/per, x+w, y+h],
                            [(2*w+h)/per, x, y+h]];
          for(const c of cornerFr){
            if(lastTraceE < c[0] && e >= c[0]) burst(c[1], c[2]);
          }
          if(lastTraceE < 1 && e >= 1) burst(x, y);
          lastTraceE = e;
        }
      }

      /* 火花(貼圖繪製) */
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i], a=(now-s.born)/s.life;
        if(a>=1){ sparks.splice(i,1); continue; }
        const fade = a<.15 ? a/.15 : 1-(a-.15)/.85;
        const sx=s.x+s.dx*a, sy=s.y+s.dy*a, r=s.r*(1-.6*a)+.8;
        ctx.globalAlpha = fade;
        ctx.drawImage(sprite, sx-r*2, sy-r*2, r*4, r*4);
      }
      ctx.globalAlpha = 1;

      if(now < END || sparks.length){ requestAnimationFrame(tick); }
      else{
        removeEventListener('resize', measure);
        canvas.remove();
      }
    }
    requestAnimationFrame(tick);
  };
})();
