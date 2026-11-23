/* BDE CESI Lille — page Boutique (ordinateur) : la roue des articles, qui tourne comme une horloge.
   Grand cadran dont le centre est au milieu du bord droit de l'écran : seule sa moitié gauche est visible.
   Les articles sont posés sur le cadran (9 emplacements tous les 40°, la liste est triplée) ; celui à 9 h est l'article
   choisi. La roue tourne à l'infini dans les deux sens : un cran de défilement (molette, pavé tactile) ou une flèche
   du clavier = un article, comme si on la tournait à la main. Souris hors de la roue : la page défile normalement.
   Un clic sur un article voisin l'amène à 9 h ; un clic sur l'article choisi ouvre sa page SumUp (nouvel onglet).
   Téléphone et tablette en hauteur : pas de roue, la simple liste d'articles. */
(function(){
"use strict";
const ul = document.getElementById("smWheel");
if(!ul) return;
const box = ul.parentElement, base = [...ul.children], N = base.length;
if(N < 2) return;
const desk = matchMedia("(min-width: 835px)");

let slots = [], M = 0, STEP = 0, cur = 0, ring = null, last = new Map(), on = false;

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
  if(!k || !on) return;
  const hadFocus = ul.contains(document.activeElement);
  cur += k;
  render();
  if(hadFocus){ const a = ul.querySelector("li.on a"); if(a) a.focus({preventScroll:true}); }
};

/* ---------- Défilement sur la roue : un cran = un article, à l'infini, dans les deux sens ----------
   Molette (gros crans) : chaque cran fait passer un article, aussi vite qu'on tourne (rien n'est jamais ignoré,
   sauf un doublon envoyé par certaines souris pour le même cran, à moins de 40 ms). Pavé tactile (petits mouvements
   continus) : ils s'additionnent, un article tous les 150 px et au plus un toutes les 300 ms, pour qu'un geste ne
   fasse passer qu'un article. La page ne défile pas tant que la souris est sur la roue. */
let acc = 0, lastMove = 0, lastDir = 0;
const onWheel = e => {
  if(!on) return;
  const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
  if(!dy) return;
  e.preventDefault();
  const dir = Math.sign(dy);
  if(dir !== lastDir){ acc = 0; lastDir = dir; }
  const now = performance.now();
  if(Math.abs(dy) >= 50){                                 /* un cran de molette */
    if(now - lastMove >= 40){ move(dir); acc = 0; lastMove = now; }
    return;
  }
  acc += dy;                                              /* pavé tactile */
  if(Math.abs(acc) >= 150 && now - lastMove >= 300){ move(dir); acc = 0; lastMove = now; }
};

/* clavier */
const onKey = e => {
  if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
};

/* clic sur un article voisin : il vient à 9 h (sans ouvrir la page) */
const onClick = e => {
  if(!on) return;
  const li = e.target.closest("li"); if(!li) return;
  const d = offset(slots.indexOf(li));
  if(d !== 0){ e.preventDefault(); move(d); }
};

const setup = () => {
  if(on) return;
  for(let r = 0; r < 2; r++) base.forEach(li => {       /* la liste triplée fait le tour complet du cadran */
    const c = li.cloneNode(true); c.dataset.clone = "1";
    c.querySelectorAll("a").forEach(a => { a.tabIndex = -1; });
    ul.appendChild(c);
  });
  slots = [...ul.children]; M = slots.length; STEP = 360 / M; cur = 0; last = new Map();
  ring = document.createElement("div");
  ring.className = "sm-ring"; ring.setAttribute("aria-hidden", "true");
  box.insertBefore(ring, ul);
  box.classList.add("is-dial");
  on = true;
  render();
  versCible();
};

/* Arrivée depuis la collection (« Commander » sur un T-shirt → boutique.html#t-shirt) : la roue tourne jusqu'à cette
   famille d'articles ; sur téléphone, sa carte de la liste est entourée de bleu. */
const cible = () => {
  let f = ""; try{ f = decodeURIComponent(location.hash.slice(1)); }catch(e){}
  return base.findIndex(li => li.dataset.famille === f);
};
const versCible = () => {
  const i = cible();
  base.forEach((li, k) => li.classList.toggle("is-cible", k === i));
  if(!on || i < 0) return;
  let d = ((i - cur) % N + N) % N; if(d > N / 2) d -= N;       /* par le chemin le plus court */
  if(d) setTimeout(() => move(d), 350);                       /* on voit la roue tourner jusqu'à l'article */
};
addEventListener("hashchange", versCible);

const teardown = () => {
  if(!on) return;
  on = false;
  ul.querySelectorAll("[data-clone]").forEach(c => c.remove());
  base.forEach(li => {
    li.removeAttribute("style"); li.removeAttribute("aria-hidden"); li.classList.remove("on", "no-anim");
    li.querySelectorAll("a").forEach(a => a.removeAttribute("tabindex"));
  });
  if(ring) ring.remove();
  ring = null;
  box.classList.remove("is-dial");
};

box.addEventListener("wheel", onWheel, {passive:false});
ul.addEventListener("keydown", onKey);
ul.addEventListener("click", onClick);
const apply = () => desk.matches ? setup() : teardown();
if(desk.addEventListener) desk.addEventListener("change", apply); else desk.addListener(apply);
apply();
if(!on) versCible();                                          /* téléphone : la carte de la famille demandée en bleu */
})();
