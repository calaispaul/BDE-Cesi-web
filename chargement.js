/* BDE CESI Lille — écran de chargement, commun à toutes les pages.
   Il s'affiche une fois par visite, sur la première page ouverte (accueil, collection, boutique, contact, infos légales),
   et ne réapparaît plus ensuite, même sur l'accueil (boot.js ne le prépare que si la visite ne l'a pas encore vu).
   Il ne se retire qu'une fois tout le site téléchargé, sans limite de temps.
   - Accueil : home.js le pilote (le médaillon de la hero se remplit de chrome liquide).
   - Autres pages : ce fichier le pilote ; le même médaillon 3D (pendant.js, #ldMedal) se remplit au centre d'un écran noir,
     puis l'écran se fond pour laisser la page. */
(function(){
"use strict";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;

/* ---------- Chargement réel de tout le site (pendant l'écran de chargement, sur la première page de la visite) ----------
   1. On lit les pages du site et on y trouve tous les fichiers utilisés (images, scripts, styles, polices, 3D),
      plus les visuels de la collection donnés par le catalogue (products.js). Rien à tenir à jour à la main :
      une image ajoutée dans une page est trouvée toute seule.
   2. On télécharge chaque fichier (6 à la fois) : il est alors dans le cache du navigateur et toutes les pages
      s'affichent ensuite complètes, sans attente.
   Le pourcentage de l'écran de chargement = fichiers téléchargés / fichiers du site (SITE.progress()).
   La boutique SumUp (autre site) est seulement préparée : elle ne compte pas dans le pourcentage. */
const SITE = ($("#hero") || root.classList.contains("ld-on")) ? (() => {
  const PAGES = ["./", "collection.html", "boutique.html", "contact.html", "infos-legales.html"];
  const SUMUP = "https://bde-cesi-lille.sumupstore.com";
  const seen = new Set(), queue = [];
  let done = 0, total = 0, listed = false, fin;
  const finished = new Promise(r => fin = r);
  /* adresse d'un fichier du site, ou null (autre site, ancre, data:) */
  const own = (u, from) => { try{ const x = new URL(u, from || location.href);
    if(x.origin !== location.origin || !/^https?:$/.test(x.protocol)) return null;
    return (x.pathname.replace(/^\//, "") || "./") + x.search; }catch(e){ return null; } };
  const add = u => { if(u && !seen.has(u)){ seen.add(u); queue.push(u); } };
  const count = () => { done++; if(listed && done >= total) fin(); };
  /* un fichier qui échoue (réseau coupé, serveur occupé) est redemandé jusqu'à 5 fois ; un fichier absent (404) ne bloque pas */
  const get = (u, kind, n = 0) => fetch(u, {credentials:"same-origin"})
    .then(r => r.ok ? (kind === "text" ? r.text() : r.blob()) : (r.status >= 500 && n < 5 ? Promise.reject() : null))
    .catch(() => n < 5 ? new Promise(res => setTimeout(res, 800 * (n + 1))).then(() => get(u, kind, n + 1)) : null);

  /* fichiers cités dans une page HTML */
  const fromPage = (html, base) => {
    const d = new DOMParser().parseFromString(html, "text/html"), found = [];
    d.querySelectorAll("img[src],script[src],video[src],source[src],audio[src],[data-src]").forEach(e => found.push(e.getAttribute("src") || e.getAttribute("data-src")));
    d.querySelectorAll("img[srcset],source[srcset]").forEach(e => e.getAttribute("srcset").split(",").forEach(s => found.push(s.trim().split(/\s+/)[0])));
    d.querySelectorAll("video[poster]").forEach(e => found.push(e.getAttribute("poster")));
    d.querySelectorAll("link[href]").forEach(e => { if(/stylesheet|preload|modulepreload|icon/.test(e.rel)) found.push(e.getAttribute("href")); });
    return found.map(u => own(u, base)).filter(Boolean);
  };
  /* fichiers cités dans une feuille de style (images, polices) ou importés par un module JS */
  const fromText = (txt, base) => {
    const found = [];
    for(const m of txt.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) if(!m[2].startsWith("#") && !m[2].startsWith("data:")) found.push(m[2]);
    for(const m of txt.matchAll(/(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) found.push(m[1]);
    return found.map(u => own(u, new URL(base, location.href).href)).filter(Boolean);
  };

  const list = async () => {
    PAGES.forEach(add);
    /* visuels de la collection (tringle 3D, fiches) : chaque coloris a une vue de côté, de face et de dos */
    if(typeof PRODUCTS !== "undefined") PRODUCTS.forEach(p => { const k = {hoodie:"pull", tshirt:"tee"}[p.id]; if(!k) return;
      p.colors.forEach(c => ["side", "face", "dos"].forEach(v => add(`images/pieces/${k}-${c.id}-${v}.webp${typeof IMG_V !== "undefined" ? "?v=" + IMG_V : ""}`))); });
    /* lecture des pages (elles comptent déjà comme fichiers téléchargés) */
    const pages = await Promise.all(PAGES.map(u => get(u, "text")));
    pages.forEach((h, i) => { if(h) fromPage(h, new URL(PAGES[i], location.href).href).forEach(add); });
    /* styles et modules : leurs propres fichiers (polices, images de fond, Three.js) */
    const texts = [...seen].filter(u => /\.(css|js)(\?|$)/.test(u) && !/^vendor\//.test(u));
    const contents = await Promise.all(texts.map(u => get(u, "text")));
    contents.forEach((t, i) => { if(t) fromText(t, texts[i]).forEach(add); });
    total = seen.size; done += PAGES.length + texts.length;   /* ceux-là viennent d'être téléchargés */
    listed = true;
    const rest = queue.filter(u => !PAGES.includes(u) && !texts.includes(u));
    let i = 0;
    const worker = async () => { while(i < rest.length){ const u = rest[i++]; await get(u, "blob"); count(); } };
    await Promise.all(Array.from({length:6}, worker));
    fin();
  };

  /* la boutique SumUp (autre site) : seulement préparée, pour qu'elle s'ouvre vite */
  const sumup = () => {
    const l = (href, rel, as) => { const e = document.createElement("link"); e.rel = rel; e.href = href; if(as) e.as = as; document.head.appendChild(e); };
    l(SUMUP, "preconnect");
    [SUMUP + "/", SUMUP + "/product/pull", SUMUP + "/product/t-shirt", SUMUP + "/product/pack-t-shirt-pull-1"].forEach(h => l(h, "prefetch", "document"));
  };
  list().catch(() => fin()); sumup();
  return {
    progress: () => listed ? (total ? Math.min(1, done / total) : 1) : 0,   /* 0 tant que la liste n'est pas faite */
    finished,
    counts: () => ({done, total})
  };
})() : null;

window.__site = SITE;

/* ---------- Écran de chargement des pages autres que l'accueil ---------- */
const L = $("#loader"), count = $("#ldCount"), box = $("#ldMedal");
if($("#hero") || !L || !box || !root.classList.contains("ld-on")){ if(L && !$("#hero") && !root.classList.contains("ld-on")) L.remove(); return; }
window.__ldCtl = true;                                        /* boot.js : l'écran de chargement est pris en main ici */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
/* pendant le chargement, rien ne se clique ni ne se parcourt au clavier : on ne part pas sur une autre page à moitié prête */
const locked = $$("body > *:not(#loader)").filter(e => !e.inert);
locked.forEach(e => { e.inert = true; });
const pageLoaded = new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r, {once:true}));
/* le compteur et le chrome suivent le vrai pourcentage de fichiers téléchargés ; au moins 1,5 s d'animation */
const t0 = performance.now();
let p = 0, done = false;
const medal = () => window.LoaderMedal ? window.LoaderMedal.state : null;
const follow = () => {
  if(done) return;
  const real = SITE ? SITE.progress() : 1;
  p += (real - p) * .12; if(real >= 1 && p > .995) p = 1;
  const m = medal(); if(m) m.fill = p;
  box.style.setProperty("--fill", p.toFixed(4));               /* sans 3D : le logo blanc se remplit en CSS */
  count.textContent = String(Math.floor(real * 100)).padStart(3, "0");
  requestAnimationFrame(follow);
};
requestAnimationFrame(follow);
const filled = new Promise(r => { const chk = () => (p >= 1 && performance.now() - t0 > 1500) ? r() : requestAnimationFrame(chk); chk(); });
Promise.all([pageLoaded, SITE ? SITE.finished : Promise.resolve(), filled]).then(() => {
  done = true; count.textContent = "100";
  const m = medal(); if(m){ m.fill = 1; m.sweep = -1; }
  box.style.setProperty("--fill", "1");
  try{ sessionStorage.setItem("bde-cesi-lille-loader", "1"); }catch(e){}
  locked.forEach(e => { e.inert = false; });
  L.classList.add("ld-done");                                  /* le compteur s'efface, un reflet balaie le chrome */
  const sweepStart = performance.now();
  const sweep = now => { const k = Math.min(1, (now - sweepStart) / 1200), mm = medal(); if(mm) mm.sweep = -1 + 2 * k; if(k < 1) requestAnimationFrame(sweep); };
  if(!reduce) requestAnimationFrame(sweep);
  setTimeout(() => {
    L.classList.add("ld-out");                                 /* l'écran noir se fond */
    setTimeout(() => { root.classList.remove("ld-on"); L.remove(); if(window.LoaderMedal) window.LoaderMedal.stop(); }, reduce ? 0 : 900);
  }, reduce ? 0 : 900);
});
})();
