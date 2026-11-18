/* BDE CESI Lille — Accueil / lookbook
   Animations : GSAP + ScrollTrigger (vendor/). Tout reste lisible sans JS ou avec « moins d'animations ». */
(function(){
"use strict";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;

/* ---------- Données (products.js) ---------- */
try{
  if(typeof PRODUCTS !== "undefined"){
    const h = PRODUCTS.find(p => p.id === "hoodie");
    if(h && h.price) $$("[data-price]").forEach(e => e.textContent = h.price.toLocaleString("fr-FR", {style:"currency", currency:"EUR", minimumFractionDigits: Number.isInteger(h.price) ? 0 : 2}));
  }
}catch(e){}

/* ---------- Sans GSAP ou mouvement réduit : on s'arrête là ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!window.gsap || !window.ScrollTrigger || reduce){
  root.classList.remove("js-anim", "ld-on");
  const hint = $(".drag-hint"); if(hint) hint.hidden = true;   /* la rotation à la main a besoin de GSAP */
  return;
}

gsap.registerPlugin(ScrollTrigger);
gsap.config({nullTargetWarn:false});
gsap.ticker.lagSmoothing(0); /* sur un appareil lent, l'animation saute des images au lieu de ralentir : le contenu ne reste jamais caché */
gsap.defaults({ease:"power3.out"});
const mm = gsap.matchMedia();
const DESK = "(min-width: 835px)", MOB = "(max-width: 834px)";

/* =====================================================================
   1. ENTRÉE DE LA HERO
   ===================================================================== */
const logo = $("#heroLogo");
/* P = état du pendentif 3D (pendant.js). Sans WebGL, on garde l'image chromée animée en CSS. */
const P = window.Pendant ? window.Pendant.state : null;
const loading = root.classList.contains("ld-on") && !!$("#loader");
const intro = gsap.timeline({defaults:{ease:"expo.out"}, paused:loading});   /* avec l'écran de chargement, l'entrée attend sa sortie */
if(loading){
  /* le médaillon est déjà là, sous le blason liquide de l'écran de chargement : pas d'arrivée, juste un reflet */
  if(P) intro.fromTo(P, {sweep:-1}, {sweep:1, duration:1.6, ease:"power2.inOut"}, .2);
  else intro.fromTo(".shine", {"--sx":"-60%"}, {"--sx":"520%", duration:1.6, ease:"power2.inOut"}, .2);
}else if(P){
  intro
    .set(logo, {opacity:1}, 0)
    .fromTo("#medalInner", {opacity:0, scale:1.3, y:80, filter:"blur(26px)"}, {opacity:1, scale:1, y:0, filter:"blur(0px)", duration:2.2,
      onComplete:() => { $("#medalInner").style.filter = ""; }}, .15)
    .fromTo(P, {spinIn:-200}, {spinIn:0, duration:2.8}, .15)                                   /* il arrive en tournant */
    .fromTo(P, {sweep:-1}, {sweep:1, duration:1.6, ease:"power2.inOut"}, 1.1);                /* reflet qui balaie le chrome */
}else{
  intro
    .fromTo(logo, {opacity:0, scale:1.45, rotationY:-38, rotationX:8, y:80, filter:"blur(26px)"},
                  {opacity:1, scale:1, rotationY:0, rotationX:0, y:0, filter:"blur(0px)", duration:2.2}, .15)
    .fromTo(".shine", {"--sx":"-60%"}, {"--sx":"520%", duration:1.6, ease:"power2.inOut"}, 1.1);
}
const T0 = loading ? -.4 : 0;                                /* après l'écran de chargement, les textes arrivent plus tôt */
intro
  .fromTo(".hero h1 .ln > span", {y:0, yPercent:110}, {y:0, yPercent:0, duration:1.4, stagger:.11}, .55 + T0)
  .fromTo(".hero .sub", {opacity:0, y:22}, {opacity:1, y:0, duration:1.1}, 1.05 + T0)
  .fromTo(".hero .ctas", {opacity:0, y:22}, {opacity:1, y:0, duration:1.1}, 1.2 + T0)
  .fromTo("#gnav", {opacity:0, y:-14}, {opacity:1, y:0, duration:1}, 1.2 + T0)
  .fromTo(".drag-hint", {opacity:0, y:16}, {opacity:1, y:0, duration:1}, 1.9 + T0)
  .fromTo(".scroll-hint", {opacity:0}, {opacity:1, duration:1}, 2 + T0)
  .add(() => { if(logo){ logo.style.filter = ""; startTilt(); } });

/* Écran de chargement : la page est noire et le médaillon 3D lui-même (à sa place exacte dans la hero) se remplit
   de chrome liquide de bas en haut, pendant que le compteur descend de 100 à 000. Il attend la fin du chargement
   (6 s au plus), puis un reflet balaie le chrome et le noir se fond en blanc autour de lui : aucun déplacement. */
if(loading){
  const L = $("#loader"), count = $("#ldCount"), hero = $("#hero"), st = {p:0};
  gsap.set(logo, {opacity:1});
  if(P){ P.spinIn = 0; P.fill = 0; }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pageLoaded = new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r, {once:true}));
  const counting = gsap.to(st, {p:1, duration:2.6, ease:"power1.inOut", onUpdate:() => {
    if(P) P.fill = st.p;
    count.textContent = String(Math.round(100 - st.p * 100)).padStart(3, "0");
  }});
  Promise.all([Promise.race([pageLoaded, wait(6000)]), counting.then()]).then(() => {
    try{ sessionStorage.setItem("bde-cesi-lille-loader", "1"); }catch(e){}
    if(P) P.fill = 1;
    gsap.timeline()
      .to(count, {opacity:0, duration:.35})
      .add(() => intro.play(0), .1)                                                  /* reflet sur le chrome, puis les textes */
      .to([document.body, hero], {backgroundColor:"#ffffff", duration:1.1, ease:"power2.inOut"}, .35)   /* le noir se fond en blanc */
      .add(() => { root.classList.remove("ld-on"); gsap.set([document.body, hero], {clearProps:"backgroundColor"}); L.remove(); });
  });}else{ const L = $("#loader"); if(L) L.remove(); }
/* Flottement très léger du blason (le pendentif 3D, lui, se balance sur sa chaîne) */
if(!P) gsap.to("#heroSpin", {y:-10, duration:3.2, ease:"sine.inOut", yoyo:true, repeat:-1, delay:2.4});

/* Rotation à la main : maintenir le clic (ou le doigt) et faire glisser.
   Au relâchement, le blason garde son élan puis revient de face. */
{
  const spin = $("#heroSpin");
  if(spin){
  const T = P || spin;                     /* ce qui tourne : le modèle 3D, ou l'image en secours */
  let rotY = 0, rotX = 0, down = false, sx = 0, sy = 0, bx = 0, by = 0, lx = 0, lt = 0, vel = 0, hinted = false;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const to = (d, ease) => gsap.to(T, {rotationY:rotY, rotationX:rotX, duration:d, ease, overwrite:"auto"});
  const hideHint = () => { if(!hinted){ hinted = true; gsap.to(".drag-hint", {opacity:0, y:10, duration:.6}); } };
  const settle = () => {
    const target = Math.round((rotY + clamp(vel * 420, -900, 900)) / 360) * 360;
    rotY = target; rotX = 0;
    gsap.to(T, {rotationY:target, rotationX:0, duration:1.8, ease:"expo.out", overwrite:"auto",
      onComplete:() => { rotY = 0; gsap.set(T, {rotationY:0}); }});
  };
  spin.addEventListener("pointerdown", e => {
    if(e.button !== 0) return;
    down = true; spin.setPointerCapture(e.pointerId); spin.classList.add("dragging"); hideHint();
    sx = lx = e.clientX; sy = e.clientY; bx = rotY = gsap.getProperty(T, "rotationY"); by = rotX = gsap.getProperty(T, "rotationX");
    lt = performance.now(); vel = 0;
  });
  spin.addEventListener("pointermove", e => {
    if(!down) return;
    rotY = bx + (e.clientX - sx) * .55;
    rotX = clamp(by - (e.clientY - sy) * .3, -40, 40);
    const now = performance.now(), dt = Math.max(1, now - lt);
    vel = vel * .6 + ((e.clientX - lx) * .55 / dt) * .4;   /* degrés par ms, lissé */
    lx = e.clientX; lt = now;
    to(.35, "power3.out");
  });
  const release = e => {
    if(!down) return;
    down = false; spin.classList.remove("dragging");
    if(spin.hasPointerCapture(e.pointerId)) spin.releasePointerCapture(e.pointerId);
    if(performance.now() - lt > 120) vel = 0;               /* bouton gardé immobile : pas d'élan */
    settle();
  };
  spin.addEventListener("pointerup", release);
  spin.addEventListener("pointercancel", release);
  /* Clavier : un tour complet à gauche ou à droite */
  spin.addEventListener("keydown", e => {
    if(e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault(); hideHint();
    rotY = gsap.getProperty(T, "rotationY") + (e.key === "ArrowRight" ? 360 : -360); rotX = 0; vel = 0;
    gsap.to(T, {rotationY:rotY, rotationX:0, duration:1.6, ease:"expo.inOut", overwrite:"auto",
      onComplete:() => { rotY = 0; gsap.set(T, {rotationY:0}); }});
  });
  }
}

/* Inclinaison 3D au pointeur (souris uniquement) */
function startTilt(){
  if(!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const rx = gsap.quickTo(P || logo, P ? "tiltX" : "rotationX", {duration:1.2, ease:"power3.out"});
  const ry = gsap.quickTo(P || logo, P ? "tiltY" : "rotationY", {duration:1.2, ease:"power3.out"});
  const hero = $("#hero");
  if(!hero) return;
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    ry(((e.clientX - r.left) / r.width - .5) * 16);
    rx(-((e.clientY - r.top) / r.height - .5) * 10);
  });
  hero.addEventListener("pointerleave", () => { rx(0); ry(0); });
}

/* Sortie de la hero au scroll : texte qui s'efface, blason qui recule en profondeur */
if($("#hero")) gsap.timeline({scrollTrigger:{trigger:"#hero", start:"top top", end:"bottom top", scrub:true}})
  .to("#heroCopy", {y:-90, opacity:0, ease:"none"}, 0)
  .to(P ? {} : "#stage", P ? {} : {yPercent:22, scale:.78, opacity:.15, ease:"none"}, 0)
  .to(".drag-hint", {y:40, opacity:0, ease:"none", duration:.3}, 0);

/* Liquide noir qui suit la souris (hero et section « Merci ») : chaque mouvement dépose des gouttes qui gardent l'élan,
   glissent puis se rétractent ; le filtre SVG #inkGoo les fond en une masse aux bords nets et arrondis. */
function inkGoo(host){
  const paint = document.createElement("canvas"); paint.className = "hero-paint"; paint.setAttribute("aria-hidden", "true");
  host.prepend(paint);
  const pc = paint.getContext("2d");
  let pw = 0, ph = 0, pr = 1, last = null, painting = false, vx = 0, vy = 0;
  const blobs = [], LIFE = 1700, MAX = 420;
  const psize = () => { pr = Math.min(devicePixelRatio || 1, 1.5); pw = host.clientWidth; ph = host.clientHeight;
    paint.width = pw * pr; paint.height = ph * pr; pc.setTransform(pr, 0, 0, pr, 0, 0); };
  psize(); new ResizeObserver(psize).observe(host);
  const draw = now => {
    for(let i = blobs.length - 1; i >= 0; i--) if(now - blobs[i].t > blobs[i].life) blobs.splice(i, 1);
    pc.clearRect(0, 0, pw, ph); pc.fillStyle = "#000";
    for(const b of blobs){
      b.x += b.vx; b.y += b.vy; b.vx *= .93; b.vy *= .93;
      const g = (now - b.t) / b.life, r = b.r * (g < .15 ? .6 + g / .15 * .4 : Math.pow(1 - (g - .15) / .85, .55));
      if(r < 1) continue;
      pc.beginPath(); pc.arc(b.x, b.y, r, 0, Math.PI * 2); pc.fill();
    }
    if(blobs.length) requestAnimationFrame(draw); else { pc.clearRect(0, 0, pw, ph); painting = false; }
  };
  const stroke = (x, y, target) => {
    const rc = host.getBoundingClientRect(), px = x - rc.left, py = y - rc.top, now = performance.now();
    const ddx = last ? px - last.x : 0, ddy = last ? py - last.y : 0, d = Math.hypot(ddx, ddy);
    vx += (ddx - vx) * .35; vy += (ddy - vy) * .35;
    const n = last ? Math.max(1, Math.ceil(d / 14)) : 1, size = target * (1 + Math.min(.8, d / 90));
    for(let i = 1; i <= n && blobs.length < MAX; i++){
      const k = i / n, bx = last ? last.x + ddx * k : px, by = last ? last.y + ddy * k : py;
      blobs.push({x:bx, y:by, vx:vx * .22 + (Math.random() - .5) * 1.2, vy:vy * .22 + (Math.random() - .5) * 1.2,
        r:size * (.75 + Math.random() * .35), t:now, life:LIFE * (.85 + Math.random() * .3)});
    }
    if(d > 10){
      const c = Math.min(5, Math.floor(d / 16));
      for(let i = 0; i < c && blobs.length < MAX; i++){
        const a = Math.atan2(vy, vx) + (Math.random() - .5) * 1.6, sp = 4 + Math.random() * Math.min(18, d * .25);
        blobs.push({x:px, y:py, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp, r:size * (.12 + Math.random() * .22), t:now, life:LIFE * (.5 + Math.random() * .4)});
      }
    }
    last = {x:px, y:py};
    if(!painting){ painting = true; requestAnimationFrame(draw); }
  };
  return {stroke, lift:() => { last = null; }};
}
/* Curseur de la hero (souris uniquement) : une pastille qui inverse ce qu'elle survole.
   Sur le titre elle grossit et fait passer le texte en blanc ; sur le médaillon, un halo irisé (comme une carte holo)
   colore le chrome sans toucher au fond blanc (mode « color »), la 3D reste entière. */
if(matchMedia("(hover: hover) and (pointer: fine)").matches && $("#hero")){
  const hero = $("#hero"), title = $("#hero-title"), spin = $("#heroSpin");
  const mk = c => { const d = document.createElement("div"); d.className = c; d.setAttribute("aria-hidden", "true"); document.body.append(d); return d; };
  /* pas de pastille : on garde la flèche normale ; seuls le liquide et le halo irisé suivent la souris */
  const dot = document.createElement("div"), shared = dot, holo = mk("cur-holo");
  root.classList.add("has-cursor");
  const mv = (el, d) => [gsap.quickTo(el, "x", {duration:d, ease:"power3.out"}), gsap.quickTo(el, "y", {duration:d, ease:"power3.out"})];
  const [dx, dy] = mv(dot, .3), [hx, hy] = mv(holo, .55);   /* le halo suit avec un peu plus d'inertie */
  const range = document.createRange();
  const overTitle = (x, y) => { if(!title) return false;
    return [...title.querySelectorAll(".ln > span")].some(s => { range.selectNodeContents(s);
      return [...range.getClientRects()].some(r => x >= r.left - 6 && x <= r.right + 6 && y >= r.top && y <= r.bottom); }); };
  const overLogo = (x, y) => { if(!spin || (P && P.travel > .05)) return false; const r = spin.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return Math.hypot((x - cx) / (r.width * .5), (y - cy) / (r.height * .5)) < .92; };
  let mode = "";
  const set = m => { if(m === mode) return; mode = m; dot.dataset.mode = holo.dataset.mode = m; };
  /* Effet peinture : le liquide noir (inkGoo) derrière le texte et derrière le médaillon */
  const ink = inkGoo(hero), stroke = ink.stroke;
  hero.addEventListener("pointermove", e => {
    if(e.pointerType !== "mouse") return;
    if(!shared){ dx(e.clientX); dy(e.clientY); } hx(e.clientX); hy(e.clientY);
    const m = overTitle(e.clientX, e.clientY) ? "title" : overLogo(e.clientX, e.clientY) ? "logo" : "dot";
    set(m);
    if(!P || P.travel < .05) stroke(e.clientX, e.clientY, m === "title" ? 70 : m === "logo" ? 95 : 42);
  });
  hero.addEventListener("pointerleave", () => ink.lift());
  /* au défilement sans bouger la souris, le navigateur ne signale pas la sortie de la hero : on la vérifie nous-mêmes */
  let mx = -1, my = -1;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, {passive:true});
  addEventListener("scroll", () => {
    const el = mx < 0 ? null : document.elementFromPoint(mx, my);
    if(!el || !el.closest("#hero")){ if(!shared) dot.classList.remove("on"); holo.classList.remove("on"); set(""); ink.lift(); }
  }, {passive:true});
  hero.addEventListener("pointerenter", e => { gsap.set(shared ? holo : [dot, holo], {x:e.clientX, y:e.clientY}); dot.classList.add("on"); holo.classList.add("on"); });
  hero.addEventListener("pointerleave", () => { if(!shared) dot.classList.remove("on"); holo.classList.remove("on"); set(""); });
  hero.addEventListener("pointerdown", () => dot.classList.add("down"));
  addEventListener("pointerup", () => dot.classList.remove("down"));
}

/* Sections « Merci » et lien vers la collection : le même liquide noir que la hero, plus large sur le titre */
if(matchMedia("(hover: hover) and (pointer: fine)").matches && $("#inkZone")){
  const zone = $("#inkZone"), bigs = $$("#merci-title, #next-design"), ink = inkGoo(zone);   /* un seul calque pour les deux sections */
  zone.addEventListener("pointermove", e => {
    if(e.pointerType !== "mouse") return;
    const on = bigs.some(b => { const r = b.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
    ink.stroke(e.clientX, e.clientY, on ? 90 : 46);
  });
  zone.addEventListener("pointerleave", () => ink.lift());
}

/* ---------- 02 · Nous : photos qui répondent au scroll ----------
   (refreshPriority -1 : ces déclencheurs sont sous la section épinglée du logo, ils se calculent après elle) */
/* photo de groupe et photo de l'exécutif : elles s'ouvrent (découpe qui s'élargit) et dézooment en entrant */
[["#teamPhoto", 1.18], ["#execPhoto", 1.22]].forEach(([sel, z]) => {
  const box = $(sel); if(!box) return;
  gsap.timeline({scrollTrigger:{refreshPriority:-1, trigger:box, start:"top 92%", end:"center 55%", scrub:1}})
    .fromTo(box, {clipPath:"inset(10% 14% round 28px)"}, {clipPath:"inset(0% 0% round 28px)", ease:"none"}, 0)
    .fromTo($("img", box), {scale:z}, {scale:1, ease:"none"}, 0);
});
/* le selfie de l'exécutif, collé comme une photo, remonte en pivotant */
if($("#execPola")) gsap.fromTo("#execPola", {y:160, rotation:9}, {y:-24, rotation:-5, ease:"none",   /* en place quand la partie est plein écran */
  scrollTrigger:{refreshPriority:-1, trigger:".exec-slide", start:"top bottom", end:"top top", scrub:true}});
/* chaque membre : la photo entre de biais et se redresse, l'image glisse dans son cadre, la photo bonus va plus vite */
$$(".member").forEach((m, i) => {
  const media = $(".m-media", m), main = $(".m-main", m), extra = $(".m-extra", m), side = m.classList.contains("flip") ? 1 : -1;
  gsap.fromTo(media, {y:110, rotation:side * 4, opacity:0}, {y:0, rotation:0, opacity:1, ease:"power2.out",
    scrollTrigger:{refreshPriority:-1, trigger:m, start:"top 95%", end:"top 45%", scrub:1}});
  gsap.fromTo(main, {objectPosition:"50% 30%"}, {objectPosition:"50% 70%", ease:"none",
    scrollTrigger:{refreshPriority:-1, trigger:m, start:"top bottom", end:"bottom top", scrub:true}});
  if(extra) gsap.fromTo(extra, {y:120, rotation:side * -14}, {y:-60, rotation:side * -6, ease:"none",
    scrollTrigger:{refreshPriority:-1, trigger:m, start:"top bottom", end:"bottom top", scrub:true}});
});

/* Le médaillon 3D glisse jusqu'à la section design en tournant, et devient le logo noir (pendant.js) */
if(P && $("#medalTarget")){
  gsap.to(P, {travel:1, ease:"none",
    scrollTrigger:{trigger:"#hero", start:"top top", endTrigger:"#design", end:"top top", scrub:.6}});
}
/* Section design : le titre, l'explication et les repères arrivent pendant la fin de la descente du médaillon,
   et sont entièrement affichés au moment où il se pose. Ensuite vient le court passage épinglé du plan de la Citadelle. */
if($(".socle")) gsap.timeline({scrollTrigger:{trigger:"#design", start:"top 40%", end:"top top", scrub:.6}})
  .fromTo(".socle .s-in", {opacity:0, y:30}, {opacity:1, y:0, duration:.5, stagger:.12, ease:"power2.out"})
  .fromTo("#socleNotes", {opacity:0}, {opacity:1, duration:.4}, "-=.3");

/* Plan de la Citadelle : une fois le médaillon posé, la section design reste épinglée le temps d'un court passage.
   Le défilement (natif, donc fluide) fait apparaître le plan, puis il reste affiché un moment pour pouvoir le lire,
   avant que la page reprenne. En remontant, tout se rejoue à l'envers. */
{
  const box = $("#medalTarget"), design = $("#design");
  const landed = () => !P || P.travel > .97;
  if(design && box){
    gsap.timeline({scrollTrigger:{trigger:design, start:"top top", end:"+=120%", pin:true, scrub:.5, anticipatePin:1}})
      .fromTo(root, {"--cit":0}, {"--cit":1, duration:.55, ease:"power1.inOut"})
      .to({}, {duration:.45});                              /* petit arrêt : le plan reste affiché pour la lecture */
    /* Écran tactile : un toucher fait aussi apparaître ou disparaître le plan */
    box.addEventListener("click", () => {
      if(!matchMedia("(hover: none)").matches || !landed()) return;
      const on = parseFloat(getComputedStyle(root).getPropertyValue("--cit")) > .5;
      gsap.to(root, {"--cit":on ? 0 : 1, duration:.45, ease:"power2.out"});
    });
  }
}/* Survol d'un point de l'explication : le repère correspondant ressort sur le médaillon */
$$(".socle .keys li").forEach(li => {
  const k = "focus-" + li.dataset.k;
  li.addEventListener("pointerenter", () => root.classList.add(k));
  li.addEventListener("pointerleave", () => root.classList.remove(k));
});

/* =====================================================================
   2. TEXTES QUI APPARAISSENT
   ===================================================================== */
gsap.set("[data-rise]", {opacity:0, y:40});
ScrollTrigger.batch("[data-rise]", {
  start:"top 88%",
  once:true,
  onEnter: els => gsap.to(els, {opacity:1, y:0, duration:1.1, stagger:.09, ease:"power3.out", overwrite:"auto"})
});

/* =====================================================================
   3. OUVERTURE PLEIN CADRE (image qui s'agrandit jusqu'aux bords)
   ===================================================================== */
if($("#frame")) mm.add(DESK, () => {
  gsap.timeline({scrollTrigger:{trigger:"#frame", start:"top top", end:"+=110%", scrub:1, pin:true, anticipatePin:1}})
    .fromTo("#frame .media", {clipPath:"inset(10% 14% round 28px)"}, {clipPath:"inset(0% 0% round 0px)", ease:"none"}, 0)
    .fromTo("#frame .media img", {scale:1.22}, {scale:1, ease:"none"}, 0)
    .fromTo("#frame .caption", {opacity:0, y:30}, {opacity:1, y:0, duration:.3, ease:"power2.out"}, .7);
});
if($("#frame")) mm.add(MOB, () => {
  gsap.timeline({scrollTrigger:{trigger:"#frame", start:"top 85%", end:"center center", scrub:1}})
    .fromTo("#frame .media", {clipPath:"inset(12% 10% round 28px)"}, {clipPath:"inset(6% 4% round 28px)", ease:"none"}, 0)
    .fromTo("#frame .media img", {scale:1.25}, {scale:1.02, ease:"none"}, 0)
    .fromTo("#frame .caption", {opacity:0}, {opacity:1, duration:.3}, .6);
});

/* =====================================================================
   4. MANIFESTE : les mots se remplissent au fil du scroll
   ===================================================================== */
const man = $("#manifesto");
if(man){
  man.setAttribute("aria-label", man.textContent);
  man.innerHTML = man.textContent.trim().split(/\s+/).map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
  gsap.to($$(".w", man), {color:"#1d1d1f", stagger:.08, ease:"none",
    scrollTrigger:{trigger:man, start:"top 78%", end:"bottom 45%", scrub:true}});
}

/* =====================================================================
   5. LOOKBOOK HORIZONTAL (épinglé sur ordinateur, glisser au doigt sur mobile)
   ===================================================================== */
if($("#track")) mm.add(DESK, () => {
  const track = $("#track");
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const h = gsap.to(track, {x:() => -dist(), ease:"none",
    scrollTrigger:{trigger:"#trackWrap", start:"center 52%", end:() => "+=" + dist(), pin:true, scrub:1, anticipatePin:1, invalidateOnRefresh:true,
      onUpdate:s => gsap.set("#lbProgress", {scaleX:s.progress})}});
  /* parallaxe des visuels dans leurs cartes */
  $$(".look").forEach(card => {
    gsap.fromTo($(".img img", card), {xPercent:-5}, {xPercent:5, ease:"none",
      scrollTrigger:{trigger:card, containerAnimation:h, start:"left right", end:"right left", scrub:true}});
    gsap.fromTo(card, {scale:.94}, {scale:1, ease:"none",
      scrollTrigger:{trigger:card, containerAnimation:h, start:"left right", end:"left 60%", scrub:true}});
  });
  /* arrivée des cartes */
  gsap.from(".look", {y:80, opacity:0, duration:1.2, stagger:.08, ease:"power3.out",
    scrollTrigger:{trigger:"#trackWrap", start:"top 85%", once:true}});
});
if($("#track")) mm.add(MOB, () => {
  gsap.from(".look", {x:60, opacity:0, duration:1, stagger:.08,
    scrollTrigger:{trigger:"#trackWrap", start:"top 85%", once:true}});
});

/* =====================================================================
   6. ÉDITORIAL : images qui entrent par le côté + parallaxe interne
   ===================================================================== */
$$("[data-enter]").forEach(el => {
  const fromRight = el.dataset.enter === "right";
  gsap.fromTo(el,
    {x:fromRight ? 140 : -140, clipPath:fromRight ? "inset(0% 0% 0% 30% round 28px)" : "inset(0% 30% 0% 0% round 28px)"},
    {x:0, clipPath:"inset(0% 0% 0% 0% round 28px)", ease:"none",
     scrollTrigger:{trigger:el, start:"top 95%", end:"top 35%", scrub:1}});
});
$$("[data-parallax]").forEach(img => {
  gsap.fromTo(img, {yPercent:-7}, {yPercent:7, ease:"none",
    scrollTrigger:{trigger:img.parentElement, start:"top bottom", end:"bottom top", scrub:true}});
});

/* =====================================================================
   7. COLORIS ÉPINGLÉS : le hoodie change de teinte au scroll
   ===================================================================== */
if($("#colorsPin")){
  const pics = $$("#colorPics img"), names = $$("#colorNames li");
  const n = pics.length - 1;
  gsap.set(pics, {opacity:0}); gsap.set(pics[0], {opacity:1});
  const tl = gsap.timeline({scrollTrigger:{trigger:"#colorsPin", start:"top top", end:"+=" + (n * 70) + "%", pin:true, scrub:.8, anticipatePin:1,
    onUpdate:s => { const i = Math.round(s.progress * n); names.forEach((li, k) => li.classList.toggle("on", k === i)); }}});
  for(let i = 1; i <= n; i++){
    tl.to(pics[i - 1], {opacity:0, scale:.94, rotation:-2, duration:.6, ease:"power2.inOut"}, i - 1 + .2)
      .fromTo(pics[i], {opacity:0, scale:1.06, rotation:2}, {opacity:1, scale:1, rotation:0, duration:.6, ease:"power2.inOut"}, i - 1 + .2);
  }
  tl.to({}, {duration:.2});
  /* clic sur un nom = aller à ce coloris */
  names.forEach((li, k) => li.addEventListener("click", () => {
    const st = tl.scrollTrigger;
    window.scrollTo({top: st.start + (st.end - st.start) * (k / n) + 2, behavior:"smooth"});
  }));
}

/* =====================================================================
   8. CHIFFRES QUI DÉFILENT
   ===================================================================== */
$$("[data-count]").forEach(el => {
  const to = +el.dataset.count, o = {v:0};
  el.textContent = "0";
  ScrollTrigger.create({trigger:el, start:"top 90%", once:true,
    onEnter:() => gsap.to(o, {v:to, duration:to > 10 ? 1.6 : .9, ease:"power2.out", onUpdate:() => el.textContent = Math.round(o.v)})});
});

/* =====================================================================
   9. CARTES « ÉCOLE » : légère profondeur au scroll
   ===================================================================== */
mm.add(DESK, () => {
  $$(".school .card").forEach((c, i) => {
    gsap.fromTo(c, {yPercent:10 + (i % 3) * 10}, {yPercent:0, ease:"none",
      scrollTrigger:{trigger:".school .cards", start:"top bottom", end:"top 30%", scrub:true}});
  });
});

/* Logo du contact qui tourne doucement à l'entrée */
gsap.fromTo(".contact .mark", {rotation:-90, scale:.6}, {rotation:0, scale:1, ease:"none",
  scrollTrigger:{trigger:".contact", start:"top bottom", end:"top 40%", scrub:true}});

/* =====================================================================
   10. NAVIGATION LOCALE : section active
   ===================================================================== */
$$(".lnav .anchors a").forEach(a => {
  const sec = $(a.getAttribute("href"));
  if(!sec) return;
  ScrollTrigger.create({trigger:sec, start:"top 55%", end:"bottom 55%",
    onToggle:s => a.classList.toggle("on", s.isActive)});
});

/* Recalcul une fois toutes les images chargées */
window.addEventListener("load", () => ScrollTrigger.refresh());
/* =====================================================================
   ACCUEIL EN DIAPORAMA : une fois le défilement relâché, la page s'aimante sur la partie la plus proche,
   pour toujours voir une partie entière (hero, logo, logo + Citadelle, nous, exécutif, chaque membre, merci, bas de page)
   ===================================================================== */
if($("#hero") && $("#inkZone")){
  let pts = [0];
  const compute = () => {
    const max = ScrollTrigger.maxScroll(window) || 1, list = [0];
    const pin = ScrollTrigger.getAll().find(s => s.pin && s.trigger && s.trigger.id === "design");
    if(pin) list.push(pin.start, pin.end);
    $$("#nous, .exec-slide, .member, #inkZone").forEach(el => list.push(el.getBoundingClientRect().top + scrollY));
    list.push(max);
    pts = [...new Set(list.map(v => Math.round(Math.min(1, Math.max(0, v / max)) * 1e4) / 1e4))].sort((a, b) => a - b);
  };
  ScrollTrigger.addEventListener("refresh", compute);
  ScrollTrigger.create({start:0, end:"max", snap:{
    snapTo:v => pts.reduce((b, p) => Math.abs(p - v) < Math.abs(b - v) ? p : b, 0),
    duration:{min:.35, max:.8}, delay:.08, ease:"power2.inOut"}});
}
})();
