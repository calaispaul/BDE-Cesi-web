/* BDE CESI Lille — Collection : booster chromé + tringle (Three.js)
   - Une fois par session, un booster chromé (médaillon du logo en relief) s'affiche au centre de la zone tringle,
     qui est floutée derrière. On l'ouvre en maintenant et en glissant vers la droite sur la bande du haut
     (ou avec le bouton « Ouvrir »). Éclat d'étoiles, puis les pièces s'envolent sur la tringle.
   - Une seule tringle chromée droite qui traverse la page : on attrape et on fait glisser les vêtements,
     qui se balancent. Survol : les voisines s'écartent. Clic : fiche produit en surimpression.
   - Une pièce = un coloris (products.js). Visuels : images/pieces/<pull|tee>-<coloris>-<face|dos|side>.webp */
import * as THREE from "./vendor/three.module.min.js";

const stage = document.getElementById("rackStage");
if(stage && typeof PRODUCTS !== "undefined") boot();

function boot(){
const $ = (s, c = document) => c.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur = n => n.toLocaleString("fr-FR", {style:"currency", currency:"EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2});
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const G = window.gsap;
const KEY = "bde-cesi-lille-booster";
const D = THREE.MathUtils.degToRad;

/* ---------- Données : les coloris de chaque vêtement (pulls puis T-shirts). Un coloris = un nom, avec une ou plusieurs
   versions (couleur d'impression). Sur la tringle : tous les coloris du pull, et pour le T-shirt ceux de products.js
   (rack) ; dans la fiche, partie « Personnalisation », on choisit le coloris puis l'impression. ---------- */
const KIND = {hoodie:"pull", tshirt:"tee"};
const iv = typeof IMG_V !== "undefined" ? "?v=" + IMG_V : "";
const view3 = (k, c) => ({c, face:`images/pieces/${k}-${c.id}-face.webp${iv}`, dos:`images/pieces/${k}-${c.id}-dos.webp${iv}`, side:`images/pieces/${k}-${c.id}-side.webp${iv}`});
const groups = new Map(), pieces = [];
PRODUCTS.forEach(p => { const k = KIND[p.id]; if(!k) return; const list = [];
  p.colors.forEach(c => { const g = list.find(x => x.name === c.name);
    if(g) g.vars.push(view3(k, c)); else list.push({p, kind:k, name:c.name, teinte:c.teinte, vars:[view3(k, c)]}); });
  groups.set(p, list);
  /* téléphone (tringles en deux rangées, voir layout) : liste plus courte si products.js en donne une (rackTel) */
  const rk = (p.rackTel && (stage.clientWidth || innerWidth) < 640) ? p.rackTel : p.rack;
  const onRack = rk ? rk.map(n => list.find(g => g.name === n)).filter(Boolean) : list;
  onRack.forEach(g => pieces.push({p, kind:k, g, ...g.vars[0], vars:g.vars})); });
/* le T-shirt noir ferme la tringle */
{ const i = pieces.findIndex(x => x.kind === "tee" && x.g.name === "Noir"); if(i >= 0) pieces.push(pieces.splice(i, 1)[0]); }
/* pastille de l'écriture des pulls (les T-shirts ont leur liste dans products.js : prints) */
const INK = {"blanc":"#ffffff", "rouge":"#c8102e", "marron":"#4e3328", "bleu électrique":"#1f33c4", "rose pâle":"#f3c6d3"};

const sheet = buildSheet();
buildList();

let opened = false;
try{ opened = sessionStorage.getItem(KEY) === "1"; }catch(e){}
if(reduce) opened = true;
/* réaffiche la suite de la page (cachée par boot.js tant que le booster est fermé) et recalcule les animations au scroll */
const unlockPage = () => { const d = document.documentElement; if(!d.classList.contains("pack-closed")) return;
  d.classList.remove("pack-closed"); if(window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh()); };
if(opened) unlockPage();

let gl = false;
try{ const c = document.createElement("canvas"); gl = !!(c.getContext("webgl2") || c.getContext("webgl")); }catch(e){}
if(!gl){ unlockPage();stage.hidden = true; $("#rackFallback").classList.remove("sr"); $("#boosterUi") && ($("#boosterUi").hidden = true); return; }

/* Studio de reflets partagé par le chrome de la tringle et du booster */
function studioEnv(renderer){
  const pmrem = new THREE.PMREMGenerator(renderer), studio = new THREE.Scene();
  studio.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({color:0x58606b, side:THREE.BackSide})));
  const panel = (w, h, col, pw, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(pw), side:THREE.DoubleSide})); m.position.set(...pos); m.lookAt(0, 0, 0); studio.add(m); };
  panel(10, 6, 0xf2f4f8, 2.2, [0, 1.6, 5.9]); panel(10, 2.4, 0xffffff, 4, [0, 5.9, 1]);
  panel(1.2, 8, 0xffffff, 8, [-5.9, 0, 2]); panel(.9, 8, 0xffffff, 6, [5.9, .5, 0]);
  panel(12, 3, 0x161d2a, 1, [0, -5.9, 1.5]); panel(1.6, 1.6, 0xffffff, 14, [-3.4, 3.6, 4.4]);
  return pmrem.fromScene(studio, .03).texture;
}
/* Studio contrasté pour le chrome miroir du booster : fond sombre et bandes de lumière nettes,
   c'est ce contraste (et non une couleur) qui donne l'aspect argent poli et fait ressortir le relief */
function chromeEnv(renderer){
  const pmrem = new THREE.PMREMGenerator(renderer), studio = new THREE.Scene();
  studio.add(new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), new THREE.MeshBasicMaterial({color:0x3a3e46, side:THREE.BackSide})));
  const strip = (w, h, pw, pos, rz = 0, col = 0xffffff) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(pw), side:THREE.DoubleSide}));
    m.position.set(...pos); m.lookAt(0, 0, 0); m.rotateZ(rz); studio.add(m); };
  strip(13, 9, .95, [0, 0, 6.9]);                                       /* grand panneau clair derrière la caméra : le chrome paraît argent */
  strip(13, .9, 6, [0, 2.6, 6.6]); strip(13, .3, 8, [0, .7, 6.6]);      /* reflets nets */
  strip(13, .7, 1, [0, 1.6, 6.5], 0, 0x0c0d10); strip(13, 1.1, 1, [0, -1.5, 6.5], .06, 0x0c0d10); strip(13, .4, 1, [0, -3.2, 6.4], -.05, 0x0c0d10);   /* bandes sombres qui dessinent le relief */
  strip(.5, 12, 6, [-3.8, 0, 6.2]); strip(.3, 12, 8, [4.2, 0, 6]); strip(13, 2.5, 3.5, [0, 6.8, 1]);
  strip(6, 3, 1.2, [0, -6.8, 2]);
  return pmrem.fromScene(studio, .02).texture;
}
const makeRenderer = () => {
  const r = new THREE.WebGLRenderer({antialias:true, alpha:true});
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  return r;
};

/* =====================================================================
   TRINGLE
   ===================================================================== */
const renderer = makeRenderer();
const canvas = renderer.domElement;
canvas.className = "rack-canvas"; canvas.setAttribute("aria-hidden", "true");
stage.prepend(canvas);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 2, .1, 60);
scene.environment = studioEnv(renderer);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dbe0, 1.15));
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(2, 4, 5); scene.add(key);

const chrome = new THREE.MeshPhysicalMaterial({color:0xe9ecf1, metalness:1, roughness:.12, clearcoat:.3, envMapIntensity:1.2});
const wire = new THREE.MeshStandardMaterial({color:0x9aa1ab, metalness:.9, roughness:.3});
const BAR_Y = 1.25, SPACING = .31, YAW = D(90);   /* pièces sur la tranche (photo de côté), serrées comme sur une vraie tringle */
/* la tringle traverse toute la page : très longue, ses bouts sortent du cadre */
const bar = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, 60, 24), chrome);
bar.rotation.z = Math.PI / 2; bar.position.y = BAR_Y; scene.add(bar);

function makeHanger(){
  const g = new THREE.Group();
  const hook = new THREE.Mesh(new THREE.TorusGeometry(.034, .006, 8, 24, Math.PI * 1.35), wire);
  hook.rotation.z = -Math.PI * .18; g.add(hook);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .06, 8), wire); neck.position.y = -.06; g.add(neck);
  return g;
}
const loader = new THREE.TextureLoader(), texCache = {};
/* Textures de la tringle : chargées telles quelles (aucun traitement sur le téléphone). Les vues de profil, visibles
   tout de suite, partent en premier ; les faces et les dos (vus seulement au survol) suivent juste après. */
const tex = src => { if(!texCache[src]){ const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; texCache[src] = t; } return texCache[src]; };
const later = [];
const lazyMap = (m, src) => { later.push(() => { loader.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; m.map = t; m.needsUpdate = true; }); }); return m; };
const loadLater = () => { const run = () => { while(later.length) later.shift()(); };
  "requestIdleCallback" in window ? requestIdleCallback(run, {timeout:1200}) : setTimeout(run, 400); };

const rail = new THREE.Group(); scene.add(rail);                  /* tout ce qui glisse le long de la tringle */
/* carrousel : chaque pièce n'existe qu'une fois ; poussée hors du cadre d'un côté, elle revient de l'autre.
   La boucle fait au moins la largeur visible, pour que le passage d'un bord à l'autre se fasse hors champ. */
let LOOP = pieces.length * SPACING;
const wrap = v => ((v + LOOP / 2) % LOOP + LOOP) % LOOP - LOOP / 2;
const items = pieces.map((pc, i) => { const n = i;
  const size = pc.kind === "pull" ? 1.18 : 1.08;
  const g = new THREE.Group(), turn = new THREE.Group(), swing = new THREE.Group();   /* turn : orientation, swing : balancement */
  const mat = src => new THREE.MeshStandardMaterial({map:tex(src), transparent:true, alphaTest:.45, roughness:.92, envMapIntensity:.5});
  const matLater = src => lazyMap(new THREE.MeshStandardMaterial({transparent:true, alphaTest:.45, roughness:.92, envMapIntensity:.5}), src);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(size, size), matLater(pc.face));
  front.position.set(0, -.065 - size / 2 + size * .015, .012);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(size, size), matLater(pc.dos));
  back.rotation.y = Math.PI; back.position.set(0, front.position.y, -.012);
  /* au repos on voit la photo de côté ; au survol la pièce pivote et montre sa face */
  const sideMat = mat(pc.side); sideMat.alphaTest = .08;
  const side = new THREE.Mesh(new THREE.PlaneGeometry(size, size), sideMat), sideSwing = new THREE.Group();
  side.position.copy(front.position); side.position.z = 0; sideSwing.add(side);
  swing.add(front, back, makeHanger()); turn.add(swing); g.add(turn, sideSwing);
  turn.rotation.y = YAW; front.visible = back.visible = false;
  front.userData.item = back.userData.item = side.userData.item = g;
  const x = (i - (pieces.length - 1) / 2) * SPACING;
  g.position.set(x, BAR_Y, 0);
  g.userData = {pc, i, n, x, turn, swing, angle:0, vel:0, hover:0, shift:0, front, back, side, barY:BAR_Y, row:0};
  rail.add(g); return g;
});

/* Cadrage : on cadre sur la hauteur des vêtements, la tringle déborde des deux côtés */
let viewW = 6;
/* Téléphone : deux tringles, les pulls en haut et les T-shirts en dessous, bien espacés pour viser au doigt.
   On les fait glisser au doigt comme sur ordinateur (les vêtements se balancent) ; un toucher ouvre la fiche. */
const SPLIT_W = 640, ROW_GAP = 1.6, SPACE2 = .52;
let split = false;
const bar2 = bar.clone(); bar2.visible = false; scene.add(bar2);
function layout(){
  split = (stage.clientWidth || 0) < SPLIT_W;
  if(split){
    [items.filter(g => g.userData.pc.kind !== "tee"), items.filter(g => g.userData.pc.kind === "tee")].forEach((row, r) =>
      row.forEach((g, i) => { const u = g.userData; u.x = (i - (row.length - 1) / 2) * SPACE2; u.barY = r ? BAR_Y - ROW_GAP : BAR_Y; u.row = r; }));
  }else items.forEach((g, i) => { const u = g.userData; u.x = (i - (items.length - 1) / 2) * SPACING; u.barY = BAR_Y; u.row = 0; });
  bar2.visible = split; bar2.position.y = BAR_Y - ROW_GAP;
}
function place(){
  layout();
  const w = stage.clientWidth || 1, h = stage.clientHeight || 1, aspect = w / h;
  renderer.setSize(w, h, false); camera.aspect = aspect;
  const t = Math.tan(D(camera.fov / 2));
  if(split){                                  /* cadre les deux tringles et la plus longue rangée (5 T-shirts) */
    const top = BAR_Y + .2, bot = BAR_Y - ROW_GAP - 1.2, cy = (top + bot) / 2, wide = 5 * SPACE2 + .2;
    const d = Math.max((top - bot) / 2 / t, wide / 2 / (t * aspect));
    camera.position.set(0, cy, d); camera.lookAt(0, cy, 0); camera.updateProjectionMatrix();
    viewW = 2 * d * t * aspect; LOOP = Math.max(6 * SPACE2, viewW + .6);   /* chaque tringle boucle, comme sur ordinateur */
    clampLimits(); if(booster) booster.place(); return;
  }
  const d = Math.max(1.15 / t, 1.45 / (t * aspect));   /* au moins ~2,5 pièces en largeur sur mobile */
  camera.position.set(0, .62, d); camera.lookAt(0, .62, 0); camera.updateProjectionMatrix();
  viewW = 2 * d * t * aspect;
  LOOP = Math.max((pieces.length + 1) * SPACING, viewW + .6);   /* une pièce qui sort d'un bord rentre aussitôt par l'autre */
  clampLimits();
  if(booster) booster.place();
}

/* ---------- Glisser la tringle (souris, doigt) ---------- */
let offset = 0, target = 0, vel = 0, minOff = 0, maxOff = 0, dragging = false, moved = 0, lastX = 0, lastT = 0, worldPerPx = .01;
function clampLimits(){
  minOff = -Infinity; maxOff = Infinity;                           /* pas de bout : la tringle boucle */
  worldPerPx = viewW / (stage.clientWidth || 1);
}
canvas.style.touchAction = "pan-y";
canvas.addEventListener("pointerdown", e => {
  if(!opened || e.button !== 0) return;
  dragging = true; moved = 0; lastX = e.clientX; lastT = performance.now(); vel = 0;
  canvas.setPointerCapture(e.pointerId); canvas.classList.add("grabbing");
});
canvas.addEventListener("pointermove", e => {
  if(dragging){
    const dx = (e.clientX - lastX) * worldPerPx, now = performance.now();
    moved += Math.abs(e.clientX - lastX);
    /* résistance élastique au-delà des bouts */
    const over = target < minOff ? minOff - target : target > maxOff ? target - maxOff : 0;
    target += dx * (over ? Math.max(.2, 1 - over * 1.5) : 1);
    vel = vel * .5 + (dx / Math.max(1, now - lastT)) * 16 * .5;
    lastX = e.clientX; lastT = now;
    hovered = null;
  }else if(e.pointerType !== "touch"){
    const h = pick(e); hovered = h; canvas.style.cursor = !opened ? "" : h ? "pointer" : "grab";
  }
});
const release = e => {
  if(!dragging) return;
  dragging = false; canvas.classList.remove("grabbing");
  if(canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  if(performance.now() - lastT > 100) vel = 0;
  if(moved < (e.pointerType === "touch" ? 14 : 6)){ const h = pick(e); if(h) sheet.open(h.userData.i); }   /* un doigt bouge toujours un peu */
};
canvas.addEventListener("pointerup", release);
canvas.addEventListener("pointercancel", release);
canvas.addEventListener("pointerleave", () => { if(!dragging){ hovered = null; canvas.style.cursor = ""; } });
/* molette / pavé tactile horizontal */
canvas.addEventListener("wheel", e => {
  if(!opened || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  e.preventDefault(); target -= e.deltaX * worldPerPx;
}, {passive:false});

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let hovered = null;
function pick(e){
  const r = canvas.getBoundingClientRect();
  ptr.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  /* On choisit la pièce d'après la position sur la tringle, pas d'après l'image touchée : les photos de côté
     se chevauchent (zones transparentes comprises), ce qui faisait attraper la voisine, surtout au doigt.
     La pièce la plus proche horizontalement gagne ; celle déjà tournée de face compte un peu plus large. */
  if(!ray.ray.intersectPlane(railPlane, hitPt)) return null;
  const sp = split ? SPACE2 : SPACING;
  let best = null, bestD = Infinity;
  items.forEach(g => { const u = g.userData; if(!g.visible) return;
    if(hitPt.y > u.barY + .15 || hitPt.y < u.barY - 1.3) return;             /* la bonne tringle */
    const half = sp * .5 + u.hover * .3, d = Math.abs(hitPt.x - g.position.x) - half;
    if(d < bestD){ bestD = d; best = g; } });
  return bestD < sp * .25 ? best : null;
}
const railPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hitPt = new THREE.Vector3();

/* ---------- Boucle de rendu de la tringle ---------- */
let prevOffset = 0, t0 = performance.now(), running = false, visible = true, flying = false;
function frame(now){
  if(!running) return;
  const t = (now - t0) / 1000;
  if(!dragging){
    target += vel; vel *= .92;                                          /* élan */
    /* une fois lâchée, la tringle se recale : toutes les pièces reviennent groupées dans le cadre */
    if(Math.abs(vel) < .004){ const home = Math.round(target / LOOP) * LOOP; target += (home - target) * .05; }
    if(target < minOff) target += (minOff - target) * .12;              /* retour élastique */
    if(target > maxOff) target += (maxOff - target) * .12;
  }
  offset += (target - offset) * .18;
  const speed = offset - prevOffset; prevOffset = offset;
  const hx = hovered ? wrap(hovered.userData.x + offset) : 0;
  items.forEach((g, i) => {
    const u = g.userData, px = wrap(u.x + offset);
    /* balancement léger : les vêtements traînent un peu derrière le mouvement, sans s'emballer */
    const force = -speed * 1.3 - u.angle * .07 - u.vel * .2;
    u.vel += force; u.angle = Math.max(-.16, Math.min(.16, u.angle + u.vel));
    u.swing.rotation.z = reduce ? 0 : u.angle + Math.sin(t * .8 + i * 1.7) * .006;
    /* survol : les voisines s'écartent */
    u.hover += ((g === hovered ? 1 : 0) - u.hover) * .14;
    /* les voisines s'écartent pour laisser la pièce survolée se tourner face à nous */
    const dh = wrap(px - hx), same = !hovered || hovered.userData.row === u.row;
    u.shift += ((!hovered || g === hovered || !same ? 0 : dh < 0 ? -.42 : .42) - u.shift) * .12;
    u.turn.rotation.y = YAW * (1 - .92 * u.hover);
    const show = u.hover > .04 && !!u.front.material.map;   /* la face n'apparaît qu'une fois sa photo chargée */
    u.front.visible = u.back.visible = show;
    u.side.material.opacity = Math.max(0, 1 - u.hover * 2.2); u.side.visible = u.side.material.opacity > .01;
    u.side.parent.rotation.z = u.swing.rotation.z;
    if(!flying){ g.position.x = px + u.shift; g.position.y = u.barY + .02 * u.hover; }
    g.scale.setScalar(1);
  });
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
const start = () => { if(!running && visible && !document.hidden){ running = true; requestAnimationFrame(frame); } };
const stop = () => { running = false; };

/* =====================================================================
   BOOSTER
   ===================================================================== */
let booster = null;
const ui = $("#boosterUi");
/* Téléphone : le sachet 3D (relief du logo, reflets) demande plusieurs secondes de calcul et figeait la page.
   On y ouvre à la place le sachet en image (même rendu, déjà affiché par la page), animé en CSS. */
const PHONE = matchMedia("(max-width: 834px)").matches;
if(!opened){ items.forEach(g => { g.visible = false; }); stage.classList.add("locked"); booster = PHONE ? makeLiteBooster() : makeBooster(); }
else { ui.hidden = true; }

function makeLiteBooster(){
  const ph = ui.querySelector(".booster-ph"), body = ph && ph.querySelector("img");
  const hint = $("#boosterHint"), btn = $("#boosterOpen");
  if(!ph || !body) return makeBooster();
  ui.classList.add("lite");
  body.classList.add("bl-body");
  const top = body.cloneNode(); top.className = "bl-top"; ph.append(top);       /* la bande du haut, détachable */
  const line = document.createElement("i"); line.className = "bl-line"; ph.append(line);
  const burst = document.createElement("div"); burst.className = "bl-burst";
  for(let k = 0; k < 16; k++){ const s = document.createElement("i"), a = -Math.PI * (.08 + .84 * Math.random()), d = 60 + Math.random() * 110;
    s.style.cssText = `--l:${10 + Math.random() * 80}%;--x:${(Math.cos(a) * d).toFixed(0)}px;--y:${(Math.sin(a) * d).toFixed(0)}px;--w:${(Math.random() * .15).toFixed(2)}s`;
    burst.append(s); }
  ph.append(burst);
  let p = 0, holding = false, sx = 0, done = false;
  const setP = v => { p = v; ph.style.setProperty("--p", v.toFixed(3)); };
  ph.addEventListener("pointerdown", e => { if(done || e.button > 0) return; holding = true; sx = e.clientX; ui.classList.remove("snapback"); try{ ph.setPointerCapture(e.pointerId); }catch(err){} });
  ph.addEventListener("pointermove", e => { if(!holding) return;
    setP(Math.max(0, Math.min(1, (e.clientX - sx) / Math.max(140, ph.clientWidth * .7)))); if(p >= 1) finish(); });
  const up = () => { if(!holding) return; holding = false;
    if(!done){ ui.classList.add("snapback"); setP(0); setTimeout(() => ui.classList.remove("snapback"), 260); } };   /* lâché trop tôt */
  ph.addEventListener("pointerup", up); ph.addEventListener("pointercancel", up);
  btn.addEventListener("click", () => { if(done) return; btn.disabled = true; hint.textContent = "";
    const t0 = performance.now(), step = now => { const k = Math.min(1, (now - t0) / 450); setP(k * k * (3 - 2 * k)); k < 1 ? requestAnimationFrame(step) : finish(); };
    requestAnimationFrame(step); });
  function finish(){
    if(done) return; done = true; holding = false; setP(1); opened = true;
    try{ sessionStorage.setItem(KEY, "1"); }catch(e){}
    btn.disabled = true; hint.textContent = "";
    ui.classList.add("bl-open");                                        /* la bande s'envole, éclat d'étoiles, le sachet tombe */
    setTimeout(() => { stage.classList.remove("locked"); unlockPage(); landPieces(); }, 320);
    setTimeout(() => { ui.hidden = true; }, 1400);
  }
  return {place(){}};
}

function makeBooster(){
  const r2 = makeRenderer();
  const c2 = r2.domElement; c2.className = "booster-canvas"; c2.setAttribute("aria-hidden", "true");
  ui.prepend(c2);
  const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 40);
  sc.environment = chromeEnv(r2);
  sc.add(new THREE.HemisphereLight(0xffffff, 0xcfd3da, .6));
  /* ---- textures générées : froissé de l'aluminium, stries des soudures, impression du sachet ---- */
  const canvasTex = (w, h, draw, repeat) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); if(repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; };
  const crinkle = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = "#808080"; x.fillRect(0, 0, w, h); x.filter = "blur(1.5px)";
    for(let i = 0; i < 340; i++){                                     /* plis fins et irréguliers */
      const a = Math.random() * Math.PI, l = 20 + Math.random() * 90, cx = Math.random() * w, cy = Math.random() * h;
      x.strokeStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "0,0,0"},${.08 + Math.random() * .16})`; x.lineWidth = 1 + Math.random() * 2.5;
      x.beginPath(); x.moveTo(cx - Math.cos(a) * l, cy - Math.sin(a) * l); x.lineTo(cx + Math.cos(a) * l * .4, cy + Math.sin(a) * l * .4); x.lineTo(cx + Math.cos(a + .4) * l, cy + Math.sin(a + .4) * l); x.stroke();
    }
  }, true);
  const ridges = canvasTex(256, 32, (x, w, h) => { for(let i = 0; i < w; i += 4){ x.fillStyle = i % 8 ? "#5a5a5a" : "#d0d0d0"; x.fillRect(i, 0, 2, h); } }, true);
  ridges.repeat.set(6, 1);
  const print = canvasTex(1024, 1300, (x, w, h) => {
    const ink = "rgba(22,24,28,.88)", soft = "rgba(22,24,28,.45)";
    x.clearRect(0, 0, w, h);
    /* rayons fins derrière le médaillon */
    x.save(); x.translate(w / 2, h * .5); for(let i = 0; i < 72; i++){ x.rotate(Math.PI * 2 / 72); x.fillStyle = i % 2 ? "rgba(255,255,255,.18)" : "rgba(20,22,26,.08)"; x.fillRect(0, -1.2, w * .62, 2.4); } x.restore();
    /* cadre */
    x.strokeStyle = soft; x.lineWidth = 3; x.strokeRect(46, 60, w - 92, h - 120); x.lineWidth = 1; x.strokeRect(58, 72, w - 116, h - 144);
    x.textAlign = "center"; x.fillStyle = ink;
    x.font = "700 64px 'Segoe UI', system-ui, sans-serif"; x.fillText("B D E   C E S I   L I L L E", w / 2, 172);
    x.font = "600 30px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = soft; x.fillText("BOOSTER  ·  ÉDITION 2026 – 2027", w / 2, 222);
    x.fillStyle = ink; x.font = "800 92px 'Segoe UI', system-ui, sans-serif"; x.fillText("LA COLLECTION", w / 2, h - 250);
    x.font = "600 32px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = soft; x.fillText("8 PIÈCES  ·  PULLS & T-SHIRTS  ·  LILLE", w / 2, h - 196);
    x.textAlign = "left"; x.font = "700 26px 'Segoe UI', system-ui, sans-serif"; x.fillStyle = ink; x.fillText("N° 001", 84, h - 100);
    for(let i = 0, bx = w - 290; i < 46; i++){ const bw = [2, 3, 5][i * 7 % 3]; x.fillRect(bx, h - 140, bw, 46); bx += bw + 2 + (i * 3 % 4); }   /* code-barres */
    /* étoiles décoratives */
    const star = (sx, sy, r) => { x.beginPath(); for(let k = 0; k < 8; k++){ const a = k * Math.PI / 4, rr = k % 2 ? r * .25 : r; x.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
    x.fillStyle = ink; [[130, 300, 16], [w - 140, 340, 12], [150, h - 360, 10], [w - 170, h - 380, 18]].forEach(s => star(...s));
  });
  print.colorSpace = THREE.SRGBColorSpace;
  /* bande à déchirer : pointillés de prédécoupe + « Déchirer ici » */
  const tearPrint = canvasTex(1024, 64, (x, w, h) => {
    x.fillStyle = "rgba(22,24,28,.7)"; for(let i = 16; i < w - 120; i += 22) x.fillRect(i, 28, 12, 3);
    x.font = "700 26px 'Segoe UI', system-ui, sans-serif"; x.textAlign = "right"; x.fillText("DÉCHIRER ICI  →", w - 16, 40);
  });
  tearPrint.colorSpace = THREE.SRGBColorSpace;
  /* aluminium miroir, comme un vrai sachet chromé : très peu rugueux, juste de fins plis */
  const foil = new THREE.MeshPhysicalMaterial({color:0xf3f5f8, metalness:1, roughness:.06, clearcoat:1, clearcoatRoughness:.03, envMapIntensity:1.15,
    bumpMap:crinkle, bumpScale:.45, iridescence:.06, iridescenceIOR:1.3, side:THREE.DoubleSide});
  const W = 1.5, H = 2.1, STRIP = .2;
  const pack = new THREE.Group(); sc.add(pack);
  /* corps du sachet : un oreiller gonflé, plus fin vers les bords */
  const bodyGeo = new THREE.PlaneGeometry(W, H - STRIP, 40, 56), pos = bodyGeo.attributes.position;
  for(let i = 0; i < pos.count; i++){
    const x = pos.getX(i) / (W / 2), y = pos.getY(i) / ((H - STRIP) / 2);
    pos.setZ(i, .03 * Math.cos(x * Math.PI / 2) ** .5 * Math.cos(y * Math.PI / 2) ** .3 + .0015 * Math.sin(x * 40));   /* sachet fin, presque plat */   /* fines stries verticales */
  }
  bodyGeo.computeVertexNormals();
  const front = new THREE.Mesh(bodyGeo, foil); front.position.y = -STRIP / 2;
  const backM = new THREE.Mesh(bodyGeo, foil); backM.rotation.y = Math.PI; backM.position.y = -STRIP / 2;
  pack.add(front, backM);
  /* impression posée sur la face avant (même forme que le sachet, très légèrement devant) */
  const printM = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({map:print, transparent:true, metalness:.2, roughness:.55, polygonOffset:true, polygonOffsetFactor:-2, depthWrite:false}));
  printM.position.set(0, -STRIP / 2, .002);   /* plus d'impression : le logo en relief suffit */
  /* soudure verticale au dos */
  const fin = new THREE.Mesh(new THREE.BoxGeometry(.09, H - STRIP * 1.6, .012), new THREE.MeshPhysicalMaterial({color:0xc9ced6, metalness:1, roughness:.35, bumpMap:ridges, bumpScale:1, envMapIntensity:1.1}));
  fin.position.set(0, -STRIP / 2, -.036); pack.add(fin);
  /* bandes soudées dentelées en haut et en bas */
  const zig = (w, h, up) => { const s = new THREE.Shape(), n = 64; s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0);
    for(let i = n; i >= 0; i--){ s.lineTo(-w / 2 + w * i / n, (i % 2 ? h : h - .018)); } s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth:.012, bevelEnabled:false}); g.translate(0, 0, -.006); if(!up) g.rotateZ(Math.PI); return g; };
  const crimp = new THREE.MeshPhysicalMaterial({color:0xeef0f4, metalness:1, roughness:.12, clearcoat:.6, bumpMap:ridges, bumpScale:1.3, envMapIntensity:1.5});
  const bottom = new THREE.Mesh(zig(W, STRIP * .6, false), crimp); bottom.position.y = -H / 2 + STRIP * .1; pack.add(bottom);
  /* le haut du booster se tranche comme dans Pokémon TCG Pocket : le trait suit le doigt de gauche à droite,
     la languette se soulève à peine pendant la coupe, puis part en deux morceaux rigides qui tournoient.
     Chaîne de segments accrochée à droite ; on la casse au milieu au moment où la coupe est finie. */
  const SEG = 16, segW = W / SEG;
  const segGeo = (() => { const s = new THREE.Shape(), T = 4; s.moveTo(-segW, 0); s.lineTo(0, 0); s.lineTo(0, STRIP - .018);
    for(let i = 1; i <= T * 2; i++) s.lineTo(-segW * i / (T * 2), i % 2 ? STRIP : STRIP - .018); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {depth:.03, bevelEnabled:false}); g.translate(0, 0, -.015); return g; })();
  const stripRoot = new THREE.Group(); stripRoot.position.set(W / 2, H / 2 - STRIP, 0); pack.add(stripRoot);
  const joints = []; let parent = stripRoot;
  for(let k = 0; k < SEG; k++){
    const j = new THREE.Group(); if(k) j.position.x = -segW; parent.add(j);
    j.add(new THREE.Mesh(segGeo, crimp)); joints.push(j); parent = j;
  }
  /* trait lumineux de la déchirure, qui avance de gauche à droite + étincelle au front */
  /* trait bleu : un cœur net + un halo doux (dégradé vertical) qui grandissent ensemble */
  const lineGeo = new THREE.PlaneGeometry(W, .012); lineGeo.translate(W / 2, 0, 0);
  const line = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({color:0x1f7bff, transparent:true, opacity:0, depthWrite:false}));
  line.position.set(-W / 2, H / 2 - STRIP, .03); line.scale.x = .001; pack.add(line);
  const haloTex = canvasTex(4, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(40,130,255,0)"); g.addColorStop(.5, "rgba(40,130,255,1)"); g.addColorStop(1, "rgba(40,130,255,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const haloGeo = new THREE.PlaneGeometry(W, .1); haloGeo.translate(W / 2, 0, -.001);
  const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({map:haloTex, transparent:true, opacity:.6, depthWrite:false}));
  line.add(halo);
  /* l'ouverture : l'intérieur sombre du sachet, visible une fois le haut parti */
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({color:0x2a2d33, roughness:.6, metalness:.3, side:THREE.DoubleSide}));
  mouth.rotation.x = -Math.PI / 2; mouth.scale.set(W * .49, .03, 1); mouth.position.set(0, H / 2 - STRIP - .005, 0); mouth.visible = false; pack.add(mouth);
  const tearM = new THREE.Mesh(new THREE.PlaneGeometry(W * .96, .06), new THREE.MeshBasicMaterial({map:tearPrint, transparent:true, depthWrite:false}));
  tearM.position.set(0, H / 2 - STRIP - .035, .028);
  /* médaillon du logo en relief au centre */
  if(window.LOGO_SHAPES){
    const toShape = s => { const pts = a => { const v = []; for(let i = 0; i < a.length; i += 2) v.push(new THREE.Vector2(a[i], a[i + 1])); return v; };
      const sh = new THREE.Shape(pts(s.o)); (s.h || []).forEach(h => sh.holes.push(new THREE.Path(pts(h)))); return sh; };
    const geo = new THREE.ExtrudeGeometry(window.LOGO_SHAPES.map(toShape), {depth:.03, bevelEnabled:true, bevelThickness:.07, bevelSize:.016, bevelSegments:7, curveSegments:3});
    /* le logo embouti dans l'aluminium : même chrome miroir, grand, il occupe presque tout le sachet */
    const silver = new THREE.MeshPhysicalMaterial({color:0xf6f7fa, metalness:1, roughness:.04, clearcoat:1, clearcoatRoughness:.02, envMapIntensity:1.3});
    const b = window.LOGO_SHAPES_BOX, s = Math.min(W * .86 / (b[2] - b[0]), (H - STRIP) * .8 / (b[3] - b[1]));
    const m = new THREE.Mesh(geo, silver);
    m.scale.set(s, s, s); m.position.set(-(b[0] + b[2]) / 2 * s, -(b[1] + b[3]) / 2 * s - .06, .012);
    pack.add(m);
  }
  /* éclat d'étoiles */
  const starTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, "rgba(255,255,255,.6)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.beginPath(); for(let k = 0; k < 8; k++){ const a = k * Math.PI / 4, r = k % 2 ? 7 : 32; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.closePath(); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const N = 110, sGeo = new THREE.BufferGeometry(), sPos = new Float32Array(N * 3), sVel = [];
  for(let i = 0; i < N; i++){ const a = Math.random() * Math.PI * 2, sp = .02 + Math.random() * .06; sVel.push([Math.cos(a) * sp, Math.sin(a) * sp + .01, (Math.random() - .5) * .02]); }
  sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.PointsMaterial({map:starTex, size:.32, transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, color:0xfff3c4});
  const stars = new THREE.Points(sGeo, sMat); sc.add(stars);
  let burst = -1;
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({map:starTex, color:0x3b93ff, transparent:true, opacity:0, depthWrite:false}));
  spark.scale.setScalar(.34); spark.position.set(-W / 2, H / 2 - STRIP, .06); pack.add(spark);
  /* petites étoiles qui scintillent le long de la coupe, et une lueur douce au bout du trait */
  const glowTex = canvasTex(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, "rgba(90,165,255,.85)"); g.addColorStop(1, "rgba(40,130,255,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex, color:0xffffff, transparent:true, opacity:0, depthWrite:false}));
  glow.scale.set(.42, .42, 1); glow.position.copy(spark.position); pack.add(glow);
  const twinkles = Array.from({length:14}, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({map:starTex, color:0x9ccaff, transparent:true, opacity:0, depthWrite:false}));
    s.userData = {ph:Math.random() * 6.28, sp:6 + Math.random() * 10, u:Math.random(), dy:(Math.random() - .5) * .12}; pack.add(s); return s; });


  const fit = () => {
    /* à la sortie, le calque s'allonge vers le bas (par-dessus la section suivante) sans déplacer le sachet :
       le cadrage reste celui de la scène, on rend juste une fenêtre plus haute */
    const w = ui.clientWidth || 1, h = ui.clientHeight || 1, h0 = Math.min(h, stage.clientHeight || h);
    r2.setSize(w, h, false); cam.aspect = w / h0;
    if(h > h0 + 1) cam.setViewOffset(w, h0, 0, 0, w, h); else cam.clearViewOffset();
    const t = Math.tan(D(cam.fov / 2)), d = Math.max(1.95 / t, 1.15 / (t * cam.aspect));
    cam.position.set(0, -.3, d); cam.lookAt(0, -.35, 0);   /* le sachet un peu plus haut : plus d'air au-dessus du bouton */ cam.updateProjectionMatrix();
  };

  /* ---- Déchirer en glissant vers la droite ---- */
  let p = 0, pTarget = 0, holding = false, sx = 0, done = false;
  const hint = $("#boosterHint"), btn = $("#boosterOpen");
  c2.style.touchAction = "pan-y";
  c2.addEventListener("pointerdown", e => { if(done || e.button !== 0) return; holding = true; sx = e.clientX; c2.setPointerCapture(e.pointerId); c2.classList.add("grabbing"); });
  c2.addEventListener("pointermove", e => {
    if(!holding) return;
    pTarget = Math.max(0, Math.min(1, (e.clientX - sx) / Math.max(160, c2.clientWidth * .3)));
    if(pTarget >= 1) finish();
  });
  const let_go = e => { if(!holding) return; holding = false; c2.classList.remove("grabbing");
    if(c2.hasPointerCapture(e.pointerId)) c2.releasePointerCapture(e.pointerId);
    if(!done) pTarget = 0; };                                         /* lâché trop tôt : la bande se remet en place */
  c2.addEventListener("pointerup", let_go); c2.addEventListener("pointercancel", let_go);
  /* Bouton « Ouvrir » : réaction immédiate (bouton désactivé, coupe qui démarre tout de suite), même si le doigt
     ou la souris est encore sur le bouton ; un second clic ne relance rien */
  let auto = false;
  btn.addEventListener("click", () => {
    if(done || auto) return; auto = true;
    btn.disabled = true; hint.textContent = "";
    if(G){ const o = {v:Math.max(.08, pTarget)}; pTarget = o.v;
      G.to(o, {v:1, duration:.55, ease:"power1.inOut", onUpdate:() => { pTarget = o.v; }, onComplete:finish}); }
    else finish();
  });

  function finish(){
    if(done) return; done = true; holding = false; pTarget = 1; opened = true;
    try{ sessionStorage.setItem(KEY, "1"); }catch(e){}
    btn.disabled = true; hint.textContent = "";
    const pop = () => { burst = 0;
      for(let i = 0; i < N; i++){ sPos[i * 3] = (Math.random() - .5) * 1.1; sPos[i * 3 + 1] = H / 2 - STRIP + .15 + Math.random() * .3; sPos[i * 3 + 2] = .2; }
      sGeo.attributes.position.needsUpdate = true; };
    if(!G){ pop(); end(); return; }
    const tl = G.timeline();
    /* le haut tranché part d'un seul morceau en tournoyant ; le sachet s'ouvre et les pièces en sortent
       pour aller directement se poser sur la tringle (elles passent derrière le sachet : on les voit sortir du haut) */
    sc.attach(stripRoot);                                              /* la languette ne suit pas le sachet quand il descend */
    tl.to(stripRoot.position, {x:W / 2 + 1, y:H / 2 + 1.15, z:.5, duration:.9, ease:"power2.out"}, 0)
      .to(stripRoot.rotation, {x:-.5, y:.45, z:1, duration:.9, ease:"power1.out"}, 0)
      .to([line.material, spark.material, halo.material, glow.material, ...twinkles.map(s => s.material)], {opacity:0, duration:.3}, 0)
      .add(() => { mouth.visible = true; }, 0)
      .to(pack.scale, {x:1.06, duration:.35, ease:"back.out(3)"}, .05)
      .to(pack.rotation, {x:.22, y:0, duration:.5, ease:"power2.out"}, 0)
      .add(pop, .3)
      .add(() => { stage.classList.remove("locked"); stage.classList.add("leaving"); fit(); unlockPage(); landPieces(); }, .3)
      /* le sachet descend et sort du cadre pendant que les pièces montent sur la tringle */
      .to(pack.position, {y:-7, duration:1.3, ease:"power2.in"}, .35)
      .add(end, 1.7);
  }
  function end(){
    stage.classList.remove("locked");
    G ? G.to(ui, {opacity:0, duration:.4, onComplete:() => { ui.hidden = true; stage.classList.remove("leaving"); stopB(); }}) : (ui.hidden = true, stopB());
    if(!G){ unlockPage(); landPieces(); }
  }
  let runningB = true;
  const frameB = now => {
    if(!runningB) return;
    p += (pTarget - p) * .25;
    /* pendant la coupe, la partie déjà tranchée se soulève à peine ; une fois coupée elle redevient une plaque rigide */
    if(!done) joints.forEach((j, k) => {
      const free = Math.max(0, Math.min(1, (p - (1 - k / SEG)) * 5));
      j.rotation.z += (-free * .025 - j.rotation.z) * .3;
    });
    else joints.forEach(j => { j.rotation.z *= .8; j.rotation.x *= .8; });
    if(!done){
      line.scale.x = Math.max(.001, p); line.material.opacity = p > .01 ? .95 : 0; halo.visible = p > .01;
      spark.position.x = -W / 2 + p * W; spark.material.opacity = holding || p > .01 ? .95 : 0;
      spark.material.rotation += .12; spark.scale.setScalar(.3 + Math.sin(now / 55) * .06 + Math.random() * .05);   /* étincelle vive qui crépite */
      glow.position.x = spark.position.x; glow.material.opacity = spark.material.opacity * (.65 + Math.sin(now / 90) * .2);
      halo.material.opacity = .5 + Math.sin(now / 140) * .15;
      twinkles.forEach(s => { const d = s.userData, x = -W / 2 + d.u * p * W;   /* uniquement sur la partie déjà coupée */
        const k = Math.max(0, Math.sin(now / 1000 * d.sp + d.ph)); s.position.set(x, H / 2 - STRIP + d.dy, .07);
        s.material.opacity = p > .02 ? k * k * .95 : 0; s.scale.setScalar(.06 + k * .16); s.material.rotation = d.ph + now / 900;
        if(k < .02){ d.u = Math.random(); d.dy = (Math.random() - .5) * .12; } });
      pack.rotation.y = Math.sin(now / 1400) * .14;                    /* léger flottement pour faire briller le chrome */
      pack.rotation.x = Math.sin(now / 1900) * .05;
    }
    if(burst >= 0){
      burst += 1;
      for(let i = 0; i < N; i++){ sPos[i * 3] += sVel[i][0]; sPos[i * 3 + 1] += sVel[i][1]; sPos[i * 3 + 2] += sVel[i][2]; sVel[i][1] -= .0006; }
      sGeo.attributes.position.needsUpdate = true;
      sMat.opacity = Math.max(0, 1 - burst / 70); sMat.size = .32 + Math.sin(burst / 4) * .1;
    }
    r2.render(sc, cam);
    if(!ui.classList.contains("ready")) ui.classList.add("ready");   /* le sachet 3D remplace l'aperçu affiché pendant le chargement */
    requestAnimationFrame(frameB);
  };
  const stopB = () => { runningB = false; };
  fit(); new ResizeObserver(fit).observe(ui);
  requestAnimationFrame(frameB);
  return {place:fit};
}

/* Les pièces sortent du centre (là où était le booster) et se posent sur la tringle */
function landPieces(){
  items.forEach(g => { g.visible = true; });
  if(!G){ return; }
  flying = true;
  const from = new THREE.Vector3(0, BAR_Y - .3, .3);   /* le haut du sachet ouvert */
  /* seules les pièces visibles s'envolent du booster (de gauche à droite) ; les autres sont déjà en place hors champ */
  const posX = g => wrap(g.userData.x + offset);
  const shown = items.filter(g => Math.abs(posX(g)) < viewW / 2 + .4).sort((a, b) => a.userData.x - b.userData.x);
  let left = shown.length; if(!left){ flying = false; return; }
  items.forEach(g => { if(!shown.includes(g)) g.position.set(posX(g), g.userData.barY, 0); });
  shown.forEach((g, i) => {
    const u = g.userData, o = {t:0}, tx = posX(g), ty = u.barY;
    g.position.copy(from); g.scale.setScalar(.15);
    G.to(o, {t:1, duration:1.1, delay:.15 + i * .07, ease:"power3.out", onUpdate:() => {
      const k = o.t, a = 1 - k, midY = ty + .9;
      g.position.set(a * a * from.x + 2 * a * k * (tx * .5) + k * k * tx, a * a * from.y + 2 * a * k * midY + k * k * ty, a * a * from.z + k * k * 0);
      g.scale.setScalar(.15 + .85 * k);
      u.swing.rotation.z = Math.sin(k * Math.PI) * .25 * (i % 2 ? 1 : -1);
    }, onComplete:() => { if(--left === 0) flying = false; }});
  });
}

place();
new ResizeObserver(place).observe(stage);
new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(stage);
document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
stage.classList.add("is-3d");
start();
loadLater();                                                       /* faces et dos des pièces, après le premier affichage */

/* =====================================================================
   FICHE PRODUIT EN SURIMPRESSION
   ===================================================================== */
function buildSheet(){
  document.body.insertAdjacentHTML("beforeend", `
  <div class="piece-sheet" id="pieceSheet" role="dialog" aria-modal="true" aria-labelledby="psTitle" hidden>
    <div class="ps-card" tabindex="-1">
      <button type="button" class="ps-x" aria-label="Fermer la fiche"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div class="ps-media">
        <button type="button" class="ps-zoom" id="psZoom" aria-pressed="false" aria-label="Zoomer sur la photo"><span class="ps-zin"><img id="psImg" alt="" width="640" height="640"></span></button>
        <div class="ps-views" role="group" aria-label="Vue"><button type="button" data-v="face" aria-pressed="true">Face</button><button type="button" data-v="dos" aria-pressed="false">Dos</button><button type="button" data-v="side" aria-pressed="false">Côté</button></div>
      </div>
      <div class="ps-info" id="psInfo"></div>
      <button type="button" class="ps-nav prev" aria-label="Pièce précédente"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
      <button type="button" class="ps-nav next" aria-label="Pièce suivante"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
    </div>
  </div>`);
  const el = $("#pieceSheet"), card = $(".ps-card", el), img = $("#psImg"), info = $("#psInfo");
  let idx = 0, grp = null, vi = 0, view = "face", last = null;
  /* Zoom sur la photo : clic (ou Entrée) = ×2,5 à l'endroit visé, l'image suit ensuite le pointeur ; re-clic ou Échap = retour */
  const zb = $("#psZoom", el), zin = $(".ps-zin", el);
  let zoomed = false;
  const aim = e => { const r = zb.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)), y = Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100));
    zin.style.transformOrigin = `${x}% ${y}%`; };
  const zoom = on => { zoomed = on; zb.classList.toggle("on", on); zb.setAttribute("aria-pressed", on);
    zb.setAttribute("aria-label", on ? "Dézoomer la photo" : "Zoomer sur la photo"); if(!on) zin.style.transformOrigin = ""; };
  let openedAt = 0;   /* le toucher qui ouvre la fiche se termine par un « clic » sur la photo : on l'ignore */
  zb.addEventListener("click", e => { if(performance.now() - openedAt < 600) return; if(!zoomed && e.detail) aim(e); zoom(!zoomed); });
  zb.addEventListener("pointermove", e => { if(zoomed) aim(e); });
  const guide = p => {
    if(!p.guideTable) return "";
    const sz = p.sizes.filter(s => p.guideTable[s]), n = v => String(v).replace(".", ",");
    return `<details class="ps-guide"><summary>Guide des tailles</summary>
      <p>Mesures du vêtement posé à plat, en centimètres. A : largeur de poitrine. B : longueur.${p.guideNote ? " " + esc(p.guideNote) : ""}</p>
      <div class="sg-t"><table><thead><tr><th scope="col"><span class="sr">Mesure</span></th>${sz.map(s => `<th scope="col">${esc(s)}</th>`).join("")}</tr></thead>
      <tbody><tr><th scope="row">A</th>${sz.map(s => `<td>${n(p.guideTable[s][0])}</td>`).join("")}</tr><tr><th scope="row">B</th>${sz.map(s => `<td>${n(p.guideTable[s][1])}</td>`).join("")}</tr></tbody></table></div></details>`;
  };
  /* « Commander » mène à la boutique, roue déjà tournée sur la famille de l'article (boutique.js lit l'ancre) */
  const FAMILLE = {hoodie:"pull", tshirt:"t-shirt"};
  /* T-shirt : n'importe quelle impression sur n'importe quel coloris. Quand il n'y a pas de photo de la combinaison,
     on la compose : T-shirt sans impression + calque du dessin (devant ou dos) teinté à la couleur de l'encre. */
  const imgCache = {}, composed = {};
  const loadImg = src => imgCache[src] || (imgCache[src] = new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; }));
  const compose = (nu, view, hex) => { const key = nu + "|" + view + "|" + hex;
    return composed[key] || (composed[key] = Promise.all([loadImg(`images/pieces/tee-${nu}-${view}-nu.webp${iv}`), loadImg(`images/pieces/tee-impression-${view}.png${iv}`)]).then(([b, m]) => {
      const c = document.createElement("canvas"); c.width = b.naturalWidth; c.height = b.naturalHeight;
      const ink = document.createElement("canvas"); ink.width = c.width; ink.height = c.height;
      const k = ink.getContext("2d"); k.drawImage(m, 0, 0, c.width, c.height); k.globalCompositeOperation = "source-in"; k.fillStyle = hex; k.fillRect(0, 0, c.width, c.height);
      const x = c.getContext("2d"); x.drawImage(b, 0, 0); x.drawImage(ink, 0, 0);
      return c.toDataURL("image/webp", .9); })); };
  let shown = 0;   /* jeton : seule la dernière demande d'image s'affiche */
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const label = c => (c.printLabel || "").replace(/^(Impression|Écriture) (.)/, (_, w, l) => l.toUpperCase());
  const radios = (items, cur, key, sw, txt) => items.map((x, j) => `<button type="button" role="radio" data-${key}="${j}" title="${esc(txt(x))}" aria-checked="${j === cur}"${j === cur ? "" : ' tabindex="-1"'}>
        <i style="background:${sw(x)}"></i>${esc(txt(x))}</button>`).join("");
  const paint = () => {
    const pc = pieces[idx], p = pc.p, g = grp || pc.g, all = groups.get(p);
    let v, c, ink, inkHTML;
    if(p.prints){
      /* T-shirt : n'importe quelle impression sur n'importe quel coloris. La photo est celle de l'impression choisie
         quand elle existe, sinon celle du coloris (avec un mot pour le dire) */
      if(vi < 0) vi = Math.max(0, p.prints.findIndex(x => x.name === g.vars[0].c.print));
      ink = p.prints[vi]; v = g.vars.find(x => x.c.print === ink.name) || g.vars[0]; c = v.c;
      inkHTML = `<p class="ps-perso-l" id="psImp">Impression<span>${esc(cap(ink.name))} · ${p.prints.length} au choix</span></p>
        <div class="ps-perso-o sw" role="radiogroup" aria-labelledby="psImp">${radios(p.prints, vi, "vi", x => x.teinte, x => cap(x.name))}</div>
`;
    } else {
      if(vi < 0) vi = 0;
      v = g.vars[vi] || g.vars[0]; c = v.c; ink = {name:c.print};
      inkHTML = `<p class="ps-perso-l" id="psImp">Écriture<span>${g.vars.length > 1 ? g.vars.length + " au choix" : ""}</span></p>
        <div class="ps-perso-o" role="radiogroup" aria-labelledby="psImp">${radios(g.vars, g.vars.indexOf(v), "vi", x => INK[x.c.print] || "#fff", x => label(x.c))}</div>`;
    }
    zoom(false);
    const tok = ++shown;
    if(p.prints && c.print !== ink.name && view !== "side" && c.nu){
      compose(c.nu, view, ink.teinte).then(u => { if(tok === shown) img.src = u; }, () => { if(tok === shown) img.src = v[view]; });
    } else img.src = v[view];
    img.alt = `${p.sumupName || p.name} ${c.name}, impression ${ink.name || c.print}, ${({face:"de face", dos:"de dos", side:"de côté"})[view]}`;
    el.querySelectorAll(".ps-views button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === view));
    const choixColoris = p.rack && all.length > 1 ? `<p class="ps-perso-l" id="psCol">Coloris<span>${esc(c.name)} · ${all.length} au choix</span></p>
        <div class="ps-perso-o sw" role="radiogroup" aria-labelledby="psCol">${radios(all, all.indexOf(g), "gi", x => x.teinte || "#fff", x => x.name)}</div>` : "";
    info.innerHTML = `
      <p class="ps-kicker">${esc(p.sumupName || p.name)} · ${idx + 1} / ${pieces.length}</p>
      <h2 id="psTitle">${esc(c.name)}</h2>
      <p class="ps-price">${p.price ? eur(p.price) : ""}</p>
      <div class="ps-perso"><p class="ps-perso-t">Personnalisation</p>
        ${choixColoris}
        ${inkHTML}</div>
      <p class="ps-desc">${esc(p.desc.replace("{print}", ink.name || "blanc"))}</p>
      ${p.material ? `<p class="ps-mat">${esc(p.material)}</p>` : ""}
      ${guide(p)}
      <p class="ps-sizes">Tailles ${esc(p.sizes[0])} à ${esc(p.sizes[p.sizes.length - 1])}</p>
      ${p.sizeNote ? `<p class="ps-fit">${esc(p.sizeNote)}</p>` : ""}
      <div class="ps-buys"><a class="pill blue lg ps-buy" href="boutique.html${FAMILLE[p.id] ? "#" + FAMILLE[p.id] : ""}">Commander</a>
        <a class="ps-pack" href="boutique.html#pack"><b>−10 %</b>avec le pack pull + T-shirt</a></div>`;
  };

  /* Personnalisation : coloris (data-gi) et impression (data-vi), au clic ou aux flèches comme des boutons radio */
  const pick = (key, j) => { if(key === "gi"){ grp = groups.get(pieces[idx].p)[j]; if(!pieces[idx].p.prints) vi = 0; } else vi = j; paint();
    const n = info.querySelector(`[data-${key}="${j}"]`); if(n) n.focus({preventScroll:true}); };
  info.addEventListener("click", e => { const b = e.target.closest("[data-gi],[data-vi]"); if(!b) return;
    pick("gi" in b.dataset ? "gi" : "vi", +(b.dataset.gi ?? b.dataset.vi)); });
  info.addEventListener("keydown", e => { const b = e.target.closest("[data-gi],[data-vi]"); if(!b || !/^Arrow/.test(e.key)) return;
    e.preventDefault(); e.stopPropagation(); const key = "gi" in b.dataset ? "gi" : "vi", n = b.parentNode.children.length;
    pick(key, (+b.dataset[key] + (/Right|Down/.test(e.key) ? 1 : -1) + n) % n); });
  const api = {
    open(i){
      idx = Math.max(0, i); grp = null; vi = -1; view = "face"; paint(); last = document.activeElement; openedAt = performance.now();
      el.hidden = false; document.documentElement.classList.add("sheet-open");
      if(G && !reduce){ G.fromTo(el, {opacity:0}, {opacity:1, duration:.3}); G.fromTo(card, {y:40, scale:.96, opacity:0}, {y:0, scale:1, opacity:1, duration:.6, ease:"expo.out"}); }
      setTimeout(() => (window.__kbd ? $(".ps-x", el) : card).focus({preventScroll:true}), 30);   /* clavier : sur « fermer » ; doigt : sur la fiche, sans anneau */
    },
    close(){
      const done = () => { el.hidden = true; document.documentElement.classList.remove("sheet-open"); if(last && last.focus) last.focus(); };
      if(G && !reduce) G.to(el, {opacity:0, duration:.25, onComplete:done}); else done();
    },
    step(d){ idx = (idx + d + pieces.length) % pieces.length; grp = null; vi = -1; view = "face"; paint();
      if(G && !reduce) G.fromTo(img, {x:d * 40, opacity:0}, {x:0, opacity:1, duration:.5, ease:"expo.out"}); }
  };
  $(".ps-x", el).addEventListener("click", api.close);
  el.addEventListener("click", e => { if(e.target === el) api.close(); });
  $(".prev", el).addEventListener("click", () => api.step(-1));
  $(".next", el).addEventListener("click", () => api.step(1));
  el.querySelectorAll(".ps-views button").forEach(b => b.addEventListener("click", () => { view = b.dataset.v; paint(); }));
  document.addEventListener("keydown", e => {
    if(el.hidden) return;
    if(e.key === "Escape"){ if(zoomed) zoom(false); else api.close(); }
    if(e.key === "ArrowLeft") api.step(-1);
    if(e.key === "ArrowRight") api.step(1);
    if(e.key === "Tab"){ const f = [...el.querySelectorAll("button, a[href], summary")].filter(x => x.offsetParent !== null);
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); } }
  });
  return api;
}

/* Liste des pièces : navigation au clavier (masquée visuellement) et secours sans 3D */
function buildList(){
  const box = $("#rackFallback");
  box.innerHTML = `<ul>${pieces.map((pc, i) => `<li><button type="button" data-i="${i}"><img src="${esc(pc.face)}" alt="" width="640" height="640" loading="lazy"><span>${esc(pc.p.sumupName || pc.p.name)} · ${esc(pc.g.name)}</span></button></li>`).join("")}</ul>`;
  box.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if(b) sheet.open(+b.dataset.i); });
}
}
