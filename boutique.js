/* BDE CESI Lille — page Boutique : la roue des articles, qui tourne comme une horloge.
   Grand cadran dont le centre est au milieu du bord droit de l'écran : seule sa moitié gauche est visible.
   Les articles sont posés sur le cadran (9 emplacements tous les 40°, la liste est triplée) ; celui à 9 h est l'article
   choisi. Faire défiler dessus (molette, pavé tactile, glisser du doigt, flèches du clavier) fait tourner le cadran d'un
   cran. Un clic sur un article voisin l'amène à 9 h ; un clic sur l'article choisi ouvre sa page SumUp.
   Sans JavaScript, les articles restent une simple liste. */
(function(){
"use strict";
const ul = document.getElementById("smWheel");
if(!ul) return;
const box = ul.parentElement, base = [...ul.children], N = base.length;
if(N < 2) return;

for(let r = 0; r < 2; r++) base.forEach(li => {      /* la liste triplée fait le tour complet du cadran */
  const c = li.cloneNode(true);
  c.querySelectorAll("a").forEach(a => { a.tabIndex = -1; });
  ul.appendChild(c);
});
const slots = [...ul.children], M = slots.length, STEP = 360 / M;
let cur = 0;                                            /* nombre de crans tournés (sans limite : le cadran tourne toujours dans le bon sens) */
const last = new Map();

const ring = document.createElement("div");
ring.className = "sm-ring"; ring.setAttribute("aria-hidden", "true");
box.insertBefore(ring, ul);
box.classList.add("is-dial");

/* position d'un emplacement par rapport à 9 h : 0 = choisi, 1 = juste en dessous, -1 = juste au-dessus */
const offset = i => { let d = ((i - cur) % M + M) % M; if(d >= M / 2) d -= M; return d; };

const render = () => {
  ring.style.setProperty("--rot", (cur * STEP) + "deg");
  slots.forEach((li, i) => {
    const d = offset(i), prev = last.get(li), a = Math.abs(d);
    if(prev !== undefined && Math.abs(d - prev) > 2.5){ li.classList.add("no-anim"); void li.offsetWidth; }   /* passage par l'arrière, hors écran */
    last.set(li, d);
    li.style.setProperty("--a", (-d * STEP) + "deg");
    li.style.opacity = a <= 1 ? "1" : "0";
    li.style.visibility = a <= 1 ? "" : "hidden";
    li.style.zIndex = String(10 - a);
    li.classList.toggle("on", d === 0);
    /* seul l'article choisi est lu et atteignable au clavier ; les flèches font tourner le cadran */
    li.querySelectorAll("a").forEach(el => { el.tabIndex = d === 0 ? 0 : -1; });
    if(d === 0) li.removeAttribute("aria-hidden"); else li.setAttribute("aria-hidden", "true");
  });
  requestAnimationFrame(() => requestAnimationFrame(() => slots.forEach(li => li.classList.remove("no-anim"))));
};

const move = k => {
  if(!k) return;
  const hadFocus = ul.contains(document.activeElement);
  cur += k;
  render();
  if(hadFocus){ const on = ul.querySelector("li.on a"); if(on) on.focus({preventScroll:true}); }
};

/* molette et pavé tactile : un geste = un article, jamais plus ; la page ne défile pas pendant ce temps.
   Après un cran, la roue reste bloquée tant que le geste continue (élan du pavé tactile, molette qui tourne encore) :
   il faut une pause d'au moins 250 ms sans défilement, et au moins 500 ms en tout, avant le cran suivant. */
let acc = 0, lockUntil = 0, quietUntil = 0;
box.addEventListener("wheel", e => {
  e.preventDefault();
  const now = performance.now(), dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
  if(now < lockUntil || now < quietUntil){ quietUntil = now + 250; acc = 0; return; }
  acc += dy;
  if(Math.abs(acc) >= 30){ move(Math.sign(acc)); acc = 0; lockUntil = now + 500; quietUntil = now + 250; }
}, {passive:false});

/* doigt : glisser vers le haut ou le bas fait tourner (un cran tous les 50 px) */
let ty = null;
box.addEventListener("touchstart", e => { ty = e.touches[0].clientY; }, {passive:true});
box.addEventListener("touchmove", e => {
  if(ty === null) return;
  e.preventDefault();
  const y = e.touches[0].clientY;
  if(Math.abs(y - ty) >= 50){ move(y < ty ? 1 : -1); ty = y; }
}, {passive:false});
box.addEventListener("touchend", () => { ty = null; });

/* clavier */
ul.addEventListener("keydown", e => {
  if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
});

/* clic sur un article voisin : il vient à 9 h (sans ouvrir la page) */
ul.addEventListener("click", e => {
  const li = e.target.closest("li"); if(!li) return;
  const d = offset(slots.indexOf(li));
  if(d !== 0){ e.preventDefault(); move(d); }
});

render();
})();
