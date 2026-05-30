import{r as c,j as e,t as v}from"./vendor-react-C2yuukvA.js";import{aa as B,a as R,Q as C,H as L,L as j,p as _,J as $,K as D}from"./index-CA-4MvaF.js";import{A as k}from"./AppShell-B1JZOWup.js";import{e as A,f as G,b as W}from"./watch-data-CE2KUaOO.js";import{j as I,h as E,H as T,ap as O,a6 as F,ay as M}from"./vendor-icons-dI_tcIeF.js";import"./vendor-supabase-storage-yH4x72e6.js";import"./vendor-supabase-wpTV6VW5.js";import"./vendor-supabase-postgrest-C4rBWbCx.js";import"./vendor-supabase-realtime-3Z-qETNI.js";import"./vendor-supabase-auth-B5hrL9Ff.js";import"./vendor-zod-By9teAtI.js";import"./Logo-DU5bPi3y.js";import"./trey-tv-logo-CUbU5wB2.js";const z=2*Math.PI*65,V=10,U=[[28,32],[58,63],[88,92]],N=[[0,"Connecting to TreyTV…"],[10,"Authenticating stream…"],[22,"Loading channel data…"],[35,"Fetching video source…"],[48,"Buffering content…"],[60,"Optimizing quality…"],[72,"Almost there…"],[85,"Finalizing stream…"],[94,"Launching player…"],[99,"Starting now…"]],H={25:"25% Loaded",50:"Halfway There",75:"75% Buffered",100:"Stream Ready"};function Y(a){for(const[l,r]of U)if(a>=l&&a<r)return a+(Math.random()<.3?1:0);return Math.min(a+1+Math.floor(Math.random()*2),100)}function q({onPlay:a}){const[l,r]=c.useState([]),[o,f]=c.useState(0),[p,s]=c.useState(N[0][1]),[t,g]=c.useState(null),[x,m]=c.useState(!1),u=c.useRef(0),n=c.useRef(new Set);c.useEffect(()=>{r(Array.from({length:80},(i,d)=>({id:d,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,size:.4+Math.random()*1.4,dur:`${2+Math.random()*4}s`,delay:`${Math.random()*5}s`})))},[]),c.useEffect(()=>{const i=setInterval(()=>{const d=Y(u.current);if(d===u.current)return;const y=u.current;u.current=d,f(d);let w=N[0][1];for(const[b,P]of N)d>=b&&(w=P);s(w);for(const b of[25,50,75,100])d>=b&&y<b&&!n.current.has(b)&&(n.current.add(b),g({key:Date.now(),text:H[b]}));d>=100&&(clearInterval(i),setTimeout(()=>m(!0),1200))},60);return()=>clearInterval(i)},[]);const h=z-o/100*z;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:J}),e.jsxs("div",{className:"buf-root",children:[e.jsx("div",{className:"buf-noise"}),e.jsx("div",{className:"buf-scan"}),e.jsx("div",{className:"buf-glow"}),e.jsx("div",{className:"buf-stars","aria-hidden":"true",children:l.map(i=>e.jsx("div",{className:"buf-star",style:{left:i.left,top:i.top,width:`${i.size}px`,height:`${i.size}px`,animationDuration:i.dur,animationDelay:i.delay}},i.id))}),e.jsxs("div",{className:"buf-container",children:[e.jsxs("div",{className:"buf-logo-wrap",children:[e.jsx("span",{className:"buf-logo-trey",children:"Trey"}),e.jsxs("span",{className:"buf-logo-tv",children:["TV",e.jsxs("span",{className:"buf-spark",children:[e.jsx("span",{className:"buf-sp buf-sp1"}),e.jsx("span",{className:"buf-sp buf-sp2"}),e.jsx("span",{className:"buf-sp buf-sp3"}),e.jsx("span",{className:"buf-sp buf-sp4"})]})]})]}),e.jsxs("div",{className:"buf-ring-wrap",children:[e.jsx("div",{className:"buf-ring-outer"}),e.jsx("div",{className:"buf-ring-arc"}),e.jsx("div",{className:"buf-ring-mask"}),e.jsxs("svg",{className:"buf-ring-svg",viewBox:"0 0 160 160","aria-hidden":"true",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"bufRingGrad",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#c8860a"}),e.jsx("stop",{offset:"40%",stopColor:"#fce060"}),e.jsx("stop",{offset:"70%",stopColor:"#fff4a0"}),e.jsx("stop",{offset:"100%",stopColor:"#f0c040"})]}),e.jsxs("filter",{id:"bufRingGlow",x:"-20%",y:"-20%",width:"140%",height:"140%",children:[e.jsx("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),e.jsx("circle",{className:"buf-ring-track",cx:"80",cy:"80",r:"65"}),e.jsx("circle",{className:"buf-ring-fill",cx:"80",cy:"80",r:"65",style:{strokeDashoffset:h}})]}),e.jsxs("div",{className:"buf-ring-inner",children:[e.jsx("span",{className:"buf-pct-num",children:o}),e.jsx("span",{className:"buf-pct-sym",children:"%"})]})]}),e.jsxs("div",{className:"buf-status-wrap",children:[e.jsx("div",{className:"buf-status-label",children:p}),e.jsx("div",{className:"buf-bar-track",children:e.jsx("div",{className:"buf-bar-fill",style:{width:`${o}%`},children:e.jsx("div",{className:"buf-bar-head"})})}),e.jsx("div",{className:"buf-ticks",children:[0,25,50,75,100].map(i=>e.jsx("span",{className:`buf-tick${o>=i?" lit":""}`,children:i},i))}),e.jsx("div",{className:"buf-segs",children:Array.from({length:V},(i,d)=>{const y=(d+1)*10,w=o>=y?"done":o>=y-10?"active":"";return e.jsx("div",{className:`buf-seg${w?` ${w}`:""}`},d)})})]})]}),t&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"buf-flash pop"},`f-${t.key}`),e.jsxs("div",{className:"buf-badge show",children:["✦ ",t.text," ✦"]},`b-${t.key}`)]}),e.jsxs("div",{className:`buf-complete${x?" show":""}`,children:[e.jsxs("div",{className:"buf-co-logo",children:[e.jsx("span",{className:"buf-co-trey",children:"Trey"}),e.jsxs("span",{className:"buf-co-tv",children:["TV",e.jsxs("span",{className:"buf-co-spark",children:[e.jsx("span",{className:"buf-co-sp buf-co-sp1"}),e.jsx("span",{className:"buf-co-sp buf-co-sp2"}),e.jsx("span",{className:"buf-co-sp buf-co-sp3"}),e.jsx("span",{className:"buf-co-sp buf-co-sp4"})]})]})]}),e.jsxs("div",{className:"buf-co-divider",children:[e.jsx("div",{className:"buf-co-dline l"}),e.jsx("div",{className:"buf-co-dgem"}),e.jsx("div",{className:"buf-co-dline r"})]}),e.jsx("div",{className:"buf-co-title",children:"Thank You For Waiting"}),e.jsx("div",{className:"buf-co-exclusive",children:"Here's Your Trizzy Exclusive Clip"}),e.jsx("div",{className:"buf-co-enjoy",children:"Enjoy!"}),e.jsx("button",{className:"buf-play-btn",onClick:a,"aria-label":"Play video",children:"▶"}),e.jsx("button",{className:"buf-replay-btn",onClick:()=>window.location.reload(),children:"↺ Watch Again"})]})]})]})}const J=`
.buf-root {
  position: fixed; inset: 0; z-index: 10000;
  background: #05070D;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  font-family: 'Raleway', sans-serif;
}

.buf-noise {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

.buf-scan {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px);
}

.buf-glow {
  position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 50%, rgba(150,110,8,0.1) 0%, transparent 65%);
  animation: bufBgBreath 4s ease-in-out infinite;
}
@keyframes bufBgBreath { 0%,100%{opacity:.5} 50%{opacity:1} }

.buf-stars { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.buf-star { position: absolute; border-radius: 50%; background: #fff; animation: bufTwinkle ease-in-out infinite; }
@keyframes bufTwinkle { 0%,100%{opacity:.1} 50%{opacity:.7} }

.buf-container {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  width: min(480px, 92vw);
}

.buf-logo-wrap {
  display: flex; align-items: center; margin-bottom: 44px;
  animation: bufFadeDown .9s cubic-bezier(.16,1,.3,1) .2s both;
}
@keyframes bufFadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }

.buf-logo-trey {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(28px,6vw,42px); font-weight: 700;
  background: linear-gradient(150deg,#e0e0e0 0%,#fff 20%,#aaa 40%,#f5f5f5 58%,#888 74%,#e8e8e8 88%,#fff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufSFlow 3.5s linear 1s infinite;
  filter: drop-shadow(0 0 16px rgba(255,255,255,0.1));
}

.buf-logo-tv {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(28px,6vw,42px); font-weight: 700;
  background: linear-gradient(150deg,#a05c04 0%,#f5d050 20%,#fef8b0 36%,#e0980a 52%,#fce97a 68%,#b06408 82%,#f5d050 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufGFlow 3s linear 1.2s infinite;
  filter: drop-shadow(0 0 20px rgba(220,170,20,0.5));
  position: relative;
}

.buf-spark { position: absolute; top: -8px; right: -16px; width: 28px; height: 28px; }
.buf-sp { position: absolute; top: 50%; left: 50%; background: #fce45a; border-radius: 1px; }
.buf-sp1 { width: 1.5px; height: 24px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-sp2 { width: 24px; height: 1.5px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-sp3 { width: 1.2px; height: 16px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }
.buf-sp4 { width: 16px; height: 1.2px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }
@keyframes bufSpk { 0%,100%{opacity:.4} 50%{opacity:1} }
@keyframes bufSFlow { 0%{background-position:0% center} 100%{background-position:250% center} }
@keyframes bufGFlow { 0%{background-position:0% center} 100%{background-position:250% center} }

.buf-ring-wrap {
  position: relative; width: 160px; height: 160px; margin-bottom: 40px;
  animation: bufFadeIn .8s ease .7s both;
}
@keyframes bufFadeIn { from{opacity:0} to{opacity:1} }

.buf-ring-outer { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(240,192,64,0.08); }
.buf-ring-arc {
  position: absolute; inset: 6px; border-radius: 50%;
  background: conic-gradient(from 0deg,transparent 0%,rgba(240,192,64,0) 50%,rgba(240,192,64,0.4) 75%,rgba(252,224,96,0.9) 90%,#fce060 100%);
  animation: bufSpinArc 1.4s linear infinite;
}
@keyframes bufSpinArc { to { transform: rotate(360deg); } }
.buf-ring-mask { position: absolute; inset: 10px; border-radius: 50%; background: #05070D; }
.buf-ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.buf-ring-track { fill: none; stroke: rgba(255,255,255,0.04); stroke-width: 3; }
.buf-ring-fill {
  fill: none; stroke: url(#bufRingGrad); stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: 408; stroke-dashoffset: 408;
  transition: stroke-dashoffset 0.1s linear;
  filter: url(#bufRingGlow);
}
.buf-ring-inner {
  position: absolute; inset: 20px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  background: radial-gradient(ellipse at center, rgba(15,20,35,0.95) 60%, transparent 100%);
}
.buf-pct-num {
  font-family: 'Cinzel', serif; font-size: clamp(28px,6vw,36px); font-weight: 900; line-height: 1;
  background: linear-gradient(155deg,#b8720a,#fce060,#fffacc,#f0c040); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufGFlow 2.5s linear infinite; min-width: 3ch; text-align: center;
}
.buf-pct-sym { font-family: 'Cinzel', serif; font-size: 12px; color: rgba(240,192,64,0.5); letter-spacing: 1px; }

.buf-status-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%;
  animation: bufFadeIn .8s ease 1s both;
}
.buf-status-label {
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 5px; text-transform: uppercase;
  color: rgba(240,192,64,0.55); height: 14px; transition: opacity .3s;
}

.buf-bar-track { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; position: relative; overflow: visible; }
.buf-bar-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg,#8a5500,#e8a820,#fce060,#fff8c0,#f0c040); background-size: 200% auto;
  transition: width 0.08s linear; position: relative;
  box-shadow: 0 0 10px rgba(240,192,64,0.4), 0 0 30px rgba(240,192,64,0.15);
  animation: bufBarShimmer 1.5s linear infinite;
}
@keyframes bufBarShimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
.buf-bar-head {
  position: absolute; right: -4px; top: 50%; width: 10px; height: 10px; transform: translateY(-50%);
  background: #fff4a0; border-radius: 50%;
  box-shadow: 0 0 14px 4px rgba(252,224,96,0.7), 0 0 30px rgba(252,224,96,0.3);
  animation: bufHeadPulse 1s ease-in-out infinite;
}
@keyframes bufHeadPulse {
  0%,100%{box-shadow:0 0 14px 4px rgba(252,224,96,0.7),0 0 30px rgba(252,224,96,.3)}
  50%{box-shadow:0 0 20px 6px rgba(252,224,96,0.9),0 0 50px rgba(252,224,96,.4)}
}

.buf-ticks { display: flex; justify-content: space-between; width: 100%; margin-top: 8px; padding: 0 1px; }
.buf-tick { font-family: 'Cinzel', serif; font-size: 8px; letter-spacing: 1px; color: rgba(200,200,200,0.2); transition: color .3s, text-shadow .3s; }
.buf-tick.lit { color: rgba(240,192,64,0.6); text-shadow: 0 0 8px rgba(240,192,64,0.4); }

.buf-segs { display: flex; gap: 6px; margin-top: 18px; }
.buf-seg { width: 28px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.07); transition: background .3s, box-shadow .3s; }
.buf-seg.active { background: #f0c040; box-shadow: 0 0 8px rgba(240,192,64,0.6); }
.buf-seg.done { background: rgba(240,192,64,0.3); }

.buf-flash {
  position: absolute; inset: 0; z-index: 50; pointer-events: none; opacity: 0;
  background: radial-gradient(ellipse 50% 40% at 50% 50%,rgba(255,230,100,0.18),transparent 70%);
}
.buf-flash.pop { animation: bufFlashPop .6s ease forwards; }
@keyframes bufFlashPop { 0%{opacity:0} 20%{opacity:1} 100%{opacity:0} }

.buf-badge {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) scale(0); z-index: 60;
  background: rgba(10,14,24,0.96); border: 1px solid rgba(240,192,64,0.4); border-radius: 12px;
  padding: 14px 28px; font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 4px;
  text-transform: uppercase; color: rgba(240,192,64,0.9); pointer-events: none;
  box-shadow: 0 0 40px rgba(240,192,64,0.15), 0 8px 32px rgba(0,0,0,0.7); white-space: nowrap;
}
.buf-badge.show { animation: bufBadgePop .5s cubic-bezier(.34,1.56,.64,1) forwards, bufBadgeFade .4s ease 1.4s forwards; }
@keyframes bufBadgePop { to { transform: translate(-50%,-50%) scale(1); } }
@keyframes bufBadgeFade { to { opacity: 0; transform: translate(-50%,-60%) scale(0.9); } }

.buf-complete {
  position: absolute; inset: 0; z-index: 40;
  display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 0; padding: 20px;
  background: radial-gradient(ellipse 90% 70% at 50% 50%,rgba(8,11,22,0.99),#05070D 85%);
  opacity: 0; pointer-events: none; transition: opacity .8s ease;
}
.buf-complete.show { opacity: 1; pointer-events: all; }

.buf-co-logo { display: flex; align-items: center; margin-bottom: 32px; opacity: 0; }
.buf-complete.show .buf-co-logo { animation: bufCoItem .8s cubic-bezier(.16,1,.3,1) .2s forwards; }

.buf-co-trey {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(30px,6vw,46px); font-weight: 700;
  background: linear-gradient(150deg,#e0e0e0 0%,#fff 20%,#aaa 40%,#f5f5f5 58%,#888 74%,#e8e8e8 88%,#fff 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufSFlow 3.5s linear 1s infinite;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.12));
}
.buf-co-tv {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(30px,6vw,46px); font-weight: 700;
  background: linear-gradient(150deg,#a05c04 0%,#f5d050 20%,#fef8b0 36%,#e0980a 52%,#fce97a 68%,#b06408 82%,#f5d050 100%);
  background-size: 250% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: bufGFlow 3s linear 1.2s infinite;
  filter: drop-shadow(0 0 28px rgba(220,170,20,0.55));
  position: relative;
}
.buf-co-spark { position: absolute; top: -10px; right: -18px; width: 30px; height: 30px; }
.buf-co-sp { position: absolute; top: 50%; left: 50%; background: #fce45a; border-radius: 1px; }
.buf-co-sp1 { width: 1.5px; height: 26px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-co-sp2 { width: 26px; height: 1.5px; transform: translate(-50%,-50%); animation: bufSpk 2s ease-in-out 1.5s infinite; }
.buf-co-sp3 { width: 1.2px; height: 18px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }
.buf-co-sp4 { width: 18px; height: 1.2px; transform: translate(-50%,-50%) rotate(45deg); animation: bufSpk 2s ease-in-out 1.7s infinite; background: rgba(252,228,90,0.6); }

.buf-co-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; opacity: 0; }
.buf-complete.show .buf-co-divider { animation: bufCoItem .7s ease .45s forwards; }
.buf-co-dline { height: 1px; width: clamp(30px,6vw,60px); }
.buf-co-dline.l { background: linear-gradient(to right,transparent,rgba(240,192,64,0.6)); }
.buf-co-dline.r { background: linear-gradient(to left,transparent,rgba(240,192,64,0.6)); }
.buf-co-dgem { width: 5px; height: 5px; background: #f0c040; transform: rotate(45deg); box-shadow: 0 0 10px rgba(240,192,64,0.9); }

.buf-co-title {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(22px,5vw,36px); font-weight: 700;
  background: linear-gradient(150deg,#b8720a,#fce060,#fffacc,#f0c040); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  text-align: center; line-height: 1.2; margin-bottom: 16px; opacity: 0;
}
.buf-complete.show .buf-co-title { animation: bufCoItem .8s cubic-bezier(.16,1,.3,1) .6s forwards, bufGFlow 2.5s linear infinite; }

.buf-co-exclusive {
  font-family: 'Cinzel', serif; font-size: clamp(10px,2vw,13px); letter-spacing: 4px; text-transform: uppercase;
  color: rgba(220,220,220,0.55); text-align: center; margin-bottom: 10px; opacity: 0;
}
.buf-complete.show .buf-co-exclusive { animation: bufCoItem .8s ease .85s forwards; }

.buf-co-enjoy {
  font-family: 'Cinzel Decorative', cursive; font-size: clamp(16px,3.5vw,24px); font-weight: 700; letter-spacing: 3px;
  background: linear-gradient(120deg,#d0d0d0,#fff,#aaa,#fff,#d0d0d0); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  text-align: center; margin-bottom: 36px; opacity: 0;
}
.buf-complete.show .buf-co-enjoy { animation: bufCoItem .8s ease 1.05s forwards, bufSFlow 4s linear infinite; }

.buf-play-btn {
  display: flex; align-items: center; justify-content: center;
  width: 68px; height: 68px; border-radius: 50%; border: none;
  background: linear-gradient(135deg,#c8860a,#f5d050,#e0980a);
  box-shadow: 0 0 40px rgba(240,192,64,0.4), 0 8px 24px rgba(0,0,0,0.6);
  font-size: 24px; cursor: pointer; transition: all .3s; opacity: 0; margin-bottom: 16px; color: #000;
}
.buf-complete.show .buf-play-btn { animation: bufCoItem .6s cubic-bezier(.34,1.56,.64,1) 1.3s forwards, bufPlayPulse 2s ease-in-out 2s infinite; }
.buf-play-btn:hover { transform: scale(1.1); box-shadow: 0 0 60px rgba(240,192,64,0.6); }
@keyframes bufPlayPulse {
  0%,100%{box-shadow:0 0 40px rgba(240,192,64,0.4),0 8px 24px rgba(0,0,0,0.6)}
  50%{box-shadow:0 0 65px rgba(240,192,64,0.6),0 8px 24px rgba(0,0,0,0.6)}
}

.buf-replay-btn {
  font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: rgba(200,200,200,0.25); background: none; border: none; cursor: pointer; transition: color .3s; opacity: 0;
}
.buf-complete.show .buf-replay-btn { animation: bufCoItem .6s ease 1.6s forwards; }
.buf-replay-btn:hover { color: rgba(240,192,64,0.6); }

@keyframes bufCoItem { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
`;function K({src:a,poster:l,className:r,controls:o=!0,fallbackImg:f,onProgress:p,onEnded:s}){const t=c.useRef(null),[g,x]=c.useState(!!a),[m,u]=c.useState(!1);function n(){x(!1),u(!0),t.current?.play()}return a?e.jsxs("div",{className:"relative size-full",children:[e.jsx("video",{ref:t,src:a,poster:l,className:r,controls:o,onWaiting:()=>{m&&x(!0)},onPlaying:()=>x(!1),onTimeUpdate:h=>{const i=h.currentTarget;!i.duration||Number.isNaN(i.duration)||p?.({currentTime:i.currentTime,duration:i.duration,ratio:i.currentTime/i.duration})},onEnded:s}),g&&e.jsx(q,{onPlay:n})]}):e.jsx("img",{src:f,className:r,alt:""})}function fe(){const{id:a}=B.useParams(),{user:l,isAdmin:r}=R(),o=C(),f=c.useRef(0),p=L(),s=p.get(a),t=A(a);if(c.useEffect(()=>{s||!t||o.recordProgress({episodeId:t.id,showId:t.showId,channelId:t.channelId,progress:Math.max(.03,o.progressOf(t.id)?.progress??0),durationSeconds:t.duration*60})},[s?.content_id,t?.id]),!s&&t)return e.jsx(Q,{ep:t});if(!s)return e.jsx(k,{children:e.jsxs("div",{className:"rounded-3xl glass neon-border p-8 text-center",children:[e.jsx("h1",{className:"text-xl font-bold",children:"Episode not found"}),e.jsx(j,{to:"/",className:"text-sm text-primary mt-2 inline-block",children:"Back home"})]})});const g=l?.uid===s.creator_id;if(!(s.status==="approved"||s.status==="published"||g||r))return e.jsx(k,{children:e.jsxs("div",{className:"rounded-3xl glass neon-border p-8 text-center",children:[e.jsx(I,{className:"mx-auto size-8 text-primary mb-3"}),e.jsx("h1",{className:"text-xl font-bold",children:"Episode unavailable"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"This episode is awaiting admin approval."})]})});const m=p.submissions.filter(n=>n.content_id!==s.content_id&&(n.status==="approved"||n.status==="published")),u=m.filter(n=>n.creator_id===s.creator_id);return e.jsx(k,{wide:!0,children:e.jsxs("div",{className:"grid lg:grid-cols-[1.6fr,1fr] gap-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"rounded-3xl overflow-hidden glass neon-border",children:e.jsx("div",{className:"relative aspect-video bg-black",children:e.jsx(K,{src:s.video_url?.startsWith("blob:")?s.video_url:void 0,poster:s.thumbnail_url,fallbackImg:s.thumbnail_url||_[0].media,className:"size-full",onProgress:({currentTime:n,duration:h,ratio:i})=>{Date.now()-f.current<1e4&&i<.92||(f.current=Date.now(),o.recordProgress({episodeId:s.content_id,showId:s.show_id,channelId:s.creator_id,progress:i,progressSeconds:n,durationSeconds:h}))},onEnded:()=>o.recordProgress({episodeId:s.content_id,showId:s.show_id,channelId:s.creator_id,progress:1,completed:!0})})})}),e.jsxs("div",{className:"mt-4 space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("span",{className:`text-[10px] px-2 py-0.5 rounded-full border ${D[s.status]}`,children:$[s.status]}),e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10",children:s.quality}),e.jsxs("span",{className:"text-[10px] text-muted-foreground",children:[s.show_title," · S",s.season_number," E",s.episode_number]})]}),e.jsx("h1",{className:"text-2xl font-bold text-gradient-gold",children:s.title}),e.jsxs(j,{to:"/channel/$handle",params:{handle:s.creator_handle},className:"inline-flex items-center gap-2 hover:opacity-90",children:[e.jsx("img",{src:s.creator_avatar,className:"size-9 rounded-full object-cover",alt:""}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-sm font-semibold flex items-center gap-1",children:[s.creator_name," ",e.jsx(E,{className:"size-3 text-primary"})]}),e.jsxs("div",{className:"text-[11px] text-muted-foreground",children:["@",s.creator_handle," · View channel"]})]})]}),e.jsx("div",{className:"flex gap-2 pt-1",children:[{icon:T,label:"Like"},{icon:O,label:"Comment"},{icon:F,label:"Save"},{icon:M,label:"Share"}].map(n=>e.jsxs("button",{onClick:()=>v(n.label),className:"px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5",children:[e.jsx(n.icon,{className:"size-3.5"})," ",n.label]},n.label))}),s.short_description&&e.jsx("p",{className:"text-sm",children:s.short_description}),s.full_description&&e.jsx("p",{className:"text-sm text-muted-foreground",children:s.full_description}),s.viewer_context&&e.jsxs("div",{className:"rounded-2xl glass border border-white/10 p-3 text-xs",children:[e.jsx("div",{className:"text-[10px] tracking-[0.2em] text-primary mb-1",children:"VIEWER CONTEXT"}),s.viewer_context]}),e.jsx("div",{className:"flex flex-wrap gap-1",children:s.tags.map(n=>e.jsxs("span",{className:"text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary",children:["#",n]},n))})]})]}),e.jsxs("aside",{className:"space-y-3",children:[e.jsx(S,{title:"More from this creator",items:u}),e.jsx(S,{title:"Related episodes",items:m})]})]})})}function Q({ep:a}){const l=C(),r=G(a.showId),o=W(a.channelId),f=l.has("saved",a.id),p=l.has("watchLater",a.id),s=l.progressOf(a.id);return e.jsx(k,{wide:!0,children:e.jsxs("div",{className:"grid lg:grid-cols-[1.6fr,1fr] gap-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"rounded-3xl overflow-hidden glass neon-border",children:e.jsxs("div",{className:"relative aspect-video bg-black",children:[e.jsx("iframe",{src:`/api/pluto/player?episode=${encodeURIComponent(a.id)}`,title:a.title,allow:"autoplay; fullscreen; picture-in-picture",allowFullScreen:!0,className:"absolute inset-0 size-full border-0"}),s&&s.progress>0&&e.jsx("div",{className:"absolute bottom-0 inset-x-0 h-1.5 bg-white/15",children:e.jsx("div",{className:"h-full bg-primary",style:{width:`${Math.min(100,s.progress*100)}%`}})})]})}),e.jsxs("div",{className:"mt-4 space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[a.isLive&&e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white",children:"LIVE"}),a.premium&&e.jsx("span",{className:"text-[10px] px-2 py-0.5 rounded-full border border-primary text-primary",children:"PREMIUM"}),e.jsxs("span",{className:"text-[10px] text-muted-foreground",children:[r?.title," · S",a.season," E",a.number," · ",a.duration,"m"]})]}),e.jsx("h1",{className:"text-2xl font-bold text-gradient-gold",children:a.title}),e.jsxs(j,{to:"/channel/$handle",params:{handle:o?.handle??"trey"},className:"inline-flex items-center gap-2 hover:opacity-90",children:[e.jsx("img",{src:o?.avatar,className:"size-9 rounded-full object-cover",alt:""}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-sm font-semibold flex items-center gap-1",children:[o?.name??"Trey TV"," ",e.jsx(E,{className:"size-3 text-primary"})]}),e.jsxs("div",{className:"text-[11px] text-muted-foreground",children:["@",o?.handle??"trey"," · View channel"]})]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2 pt-1",children:[e.jsxs("button",{onClick:()=>{l.markWatched(a.id),v.success("Marked watched")},className:"px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5",children:[e.jsx(T,{className:"size-3.5"})," Mark watched"]}),e.jsxs("button",{onClick:()=>{l.toggle("saved",a.id),v(f?"Removed from saves":"Saved")},className:"px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5",children:[e.jsx(F,{className:"size-3.5"})," ",f?"Saved":"Save"]}),e.jsxs("button",{onClick:()=>{l.toggle("watchLater",a.id),v(p?"Removed from Watch Later":"Added to Watch Later")},className:"px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5",children:[e.jsx(I,{className:"size-3.5"})," ","Watch Later"]}),e.jsxs("button",{onClick:()=>v("Link copied"),className:"px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5",children:[e.jsx(M,{className:"size-3.5"})," Share"]})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:r?.description})]})]}),e.jsx("aside",{className:"space-y-3",children:e.jsxs("section",{className:"rounded-3xl glass neon-border p-3",children:[e.jsx("h3",{className:"text-sm font-bold mb-2",children:"More episodes"}),e.jsx("div",{className:"space-y-2",children:(r?.episodes??[]).filter(t=>t.id!==a.id).slice(0,5).map(t=>e.jsxs(j,{to:"/watch/$id",params:{id:t.id},className:"flex gap-2 hover:bg-white/5 rounded-xl p-1 transition",children:[e.jsx("div",{className:"relative aspect-video w-28 rounded-lg overflow-hidden shrink-0",children:e.jsx("img",{src:t.thumb,className:"absolute inset-0 size-full object-cover",alt:""})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"text-xs font-semibold truncate",children:t.title}),e.jsxs("div",{className:"text-[10px] text-muted-foreground truncate",children:["S",t.season," E",t.number," · ",t.duration,"m"]})]})]},t.id))})]})})]})})}function S({title:a,items:l}){return l.length===0?null:e.jsxs("section",{className:"rounded-3xl glass neon-border p-3",children:[e.jsx("h3",{className:"text-sm font-bold mb-2",children:a}),e.jsx("div",{className:"space-y-2",children:l.slice(0,5).map(r=>e.jsxs(j,{to:"/watch/$id",params:{id:r.content_id},className:"flex gap-2 hover:bg-white/5 rounded-xl p-1 transition",children:[e.jsx("div",{className:"relative aspect-video w-28 rounded-lg overflow-hidden shrink-0",children:e.jsx("img",{src:r.thumbnail_url||_[0].media,className:"absolute inset-0 size-full object-cover",alt:""})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:"text-xs font-semibold truncate",children:r.title}),e.jsxs("div",{className:"text-[10px] text-muted-foreground truncate",children:["@",r.creator_handle," · S",r.season_number," E",r.episode_number]})]})]},r.content_id))})]})}export{fe as component};
