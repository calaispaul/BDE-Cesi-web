/* BDE CESI Lille — page Boutique : la roue des articles.
   Les articles sont posés sur un cylindre ; faire défiler dessus (molette, pavé tactile, glisser du doigt, flèches du
   clavier) le fait tourner d'un article. Un clic sur un article du dessus ou du dessous l'amène au centre ; un clic sur
   celui du centre ouvre sa page SumUp. Sans JavaScript, les articles restent une simple liste. */
(function(){
"use strict";
const ul = document.getElementById("smWheel");
if(!ul) return;
const base = [...ul.children], N = base.length;
if(N < 2) return;

/* la roue est doublée (2 × 3 emplacements) : l'article qui passe de haut en bas le fait à l'arrière, invisible */
base.forEach(li => {
  const c = li.cloneNode(true);
  c.setAttribute("aria-hidden", "true");
  c.querySelectorAll("a").forEach(a => { a.tabIndex = -1; });
  ul.appendChild(c);
});
const slots = [...ul.children], M = slots.length;
const STEP = 30, R = 200;                 /* écart entre deux articles (degrés) et rayon du cylindre (px) */
let cur = 0;
const last = new Map();

ul.classList.add("is-wheel");
ul.tabIndex = -1;
const hint = document.querySelector(".sm-hint");
if(hint){ const t = hint.textContent; hint.textContent = ""; const sp = document.createElement("span"); sp.textContent = t; hint.appendChild(sp); hint.hidden = false; }

/* position d'un emplacement par rapport au centre : 0 au centre, négatif au-dessus, positif en dessous */
const offset = i => { let d = ((i - cur) % M + M) % M; if(d >= M / 2) d -= M; return d; };

const render = () => {
  slots.forEach((li, i) => {
    const d = offset(i), prev = last.get(li);
    if(prev !== undefined && Math.abs(d - prev) > 1.5){ li.classList.add("no-anim"); void li.offsetWidth; }   /* passage par l'arrière */
    last.set(li, d);
    const a = Math.abs(d);
    li.style.transform = `translateZ(${-R}px) rotateX(${-d * STEP}deg) translateZ(${R}px)`;
    li.style.opacity = a === 0 ? 1 : a === 1 ? .6 : 0;
    li.style.zIndex = String(10 - a);
    li.style.pointerEvents = a > 1 ? "none" : "";
    li.classList.toggle("on", d === 0);
    /* seul l'article du centre est lu et atteignable au clavier ; les flèches font tourner la roue */
    li.querySelectorAll("a").forEach(el => { el.tabIndex = d === 0 ? 0 : -1; });
    if(d === 0) li.removeAttribute("aria-hidden"); else li.setAttribute("aria-hidden", "true");
  });
  requestAnimationFrame(() => slots.forEach(li => li.classList.remove("no-anim")));
};

const move = k => {
  if(!k) return;
  const hadFocus = ul.contains(document.activeElement);
  cur = ((cur + k) % M + M) % M;
  render();
  if(hadFocus){ const on = slots[cur % N]; const a = on && on.querySelector("a"); if(a) a.focus({preventScroll:true}); }
};

/* molette et pavé tactile : un cran (ou un geste) = un article ; la page ne défile pas pendant ce temps */
let acc = 0, lockUntil = 0;
ul.addEventListener("wheel", e => {
  e.preventDefault();
  const now = performance.now(), dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
  if(now < lockUntil){ acc = 0; return; }
  acc += dy;
  if(Math.abs(acc) >= 40){ move(Math.sign(acc)); acc = 0; lockUntil = now + 320; }
}, {passive:false});

/* doigt : glisser vers le haut ou le bas fait tourner (un article tous les 44 px) */
let ty = null;
ul.addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, {passive:true});
ul.addEventListener("touchmove", e => {
  if(ty === null) return;
  e.preventDefault();
  const y = e.touches[0].clientY;
  if(Math.abs(y - ty) >= 44){ move(y < ty ? 1 : -1); ty = y; }
}, {passive:false});
ul.addEventListener("touchend", () => { ty = null; });

/* clavier */
ul.addEventListener("keydown", e => {
  if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
});

/* clic sur un article du dessus ou du dessous : il vient au centre (sans ouvrir la page) */
ul.addEventListener("click", e => {
  const li = e.target.closest("li"); if(!li) return;
  const d = offset(slots.indexOf(li));
  if(d !== 0){ e.preventDefault(); move(d); }
});

render();
})();
