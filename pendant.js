/* BDE CESI Lille — pièce d'argent en 3D aux formes du logo (Three.js, vendor/)
   Le logo plat est vectorisé dans logo-shape.js (LOGO_SHAPES) : chaque forme est extrudée
   en argent, les espaces du logo restent vides.
   home.js pilote la rotation via window.Pendant.state (degrés). */
import * as THREE from "./vendor/three.module.min.js";

const host = document.getElementById("heroSpin");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL(){
  try{ const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }catch(e){ return false; }
}

if(window.LOGO_SHAPES && supportsWebGL()){
  if(host) init();                                                    /* accueil : hero + trajet jusqu'au socle */
  document.querySelectorAll("[data-medal]").forEach(el => initSimple(el, el.dataset.medal));   /* autres pages */
}

function init(){
  const {renderer, canvas, scene, camera, pivot, piece, sweep, box, centerY, silver, geo} = buildMedal();

  /* Écran de chargement : le médaillon se remplit de chrome liquide (state.fill de 0 à 1).
     Un plan de coupe monte du bas vers le haut ; au-dessus, la même pièce en métal sombre sert de moule. */
  renderer.localClippingEnabled = true;
  const cutLiquid = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), cutMold = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const mold = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({color:0x262a31, metalness:1, roughness:.38, envMapIntensity:.35, clippingPlanes:[cutMold]}));
  piece.add(mold);
  silver.clippingPlanes = [cutLiquid]; silver.side = THREE.DoubleSide;     /* la tranche coupée paraît pleine */

  /* Le canvas vit dans un calque fixe qui glisse de la hero jusqu'à la section design */
  const target = document.getElementById("medalTarget");
  const medal = document.createElement("div");
  medal.className = "medal"; medal.id = "medal"; medal.setAttribute("aria-hidden", "true");
  const inner = document.createElement("div");
  inner.className = "medal-inner"; inner.id = "medalInner";
  inner.append(canvas); medal.append(inner); document.body.append(medal);
  document.documentElement.classList.add("medal-3d");

  /* Les repères du socle passent dans un calque au-dessus du médaillon et suivent le socle */
  const notes = document.getElementById("socleNotes");
  let layer = null;
  if(notes && target){ layer = document.createElement("div"); layer.className = "notes-layer"; layer.append(notes); document.body.append(layer); }

  /* Cadrage : la pièce entière dans un carré */
  let base = 1;
  const fit = () => {
    base = Math.max(1, Math.round(host.clientWidth));
    medal.style.width = medal.style.height = base + "px";
    renderer.setSize(base, base, false);
    camera.aspect = 1;
    const halfH = (box[3] - box[1]) / 2 + .08, halfW = (box[2] - box[0]) / 2 + .08;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(halfH, halfW) / t + .12;
    camera.position.set(0, centerY, dist);
    camera.lookAt(0, centerY, 0);
    camera.updateProjectionMatrix();
  };

  /* ---------- État piloté par home.js (degrés ; travel = 0 dans la hero, 1 posé dans le socle de la section design) ---------- */
  const state = {rotationY:0, rotationX:0, tiltX:0, tiltY:0, spinIn:0, sweep:-1, sway:1, travel:0, fill:document.documentElement.classList.contains("ld-on") ? 0 : 1};
  const lowY = box[1] - .04, highY = box[3] + .04, nrm = new THREE.Vector3();
  const D = THREE.MathUtils.degToRad;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const smoothstep = v => v * v * (3 - 2 * v);

  /* Position du calque : interpolation entre la place dans la hero et la place dans la section design */
  const place = p => {
    if(layer){ const r = target.getBoundingClientRect();
      layer.style.cssText = `width:${r.width}px;height:${r.height}px;transform:translate3d(${r.left.toFixed(1)}px,${r.top.toFixed(1)}px,0)`; }
    const a = host.getBoundingClientRect();
    let cx = a.left + a.width / 2, cy = a.top + a.height / 2, s = a.width;
    if(target && p > 0){
      const r = target.getBoundingClientRect(), ts = Math.min(r.width, r.height) * .97;
      cx += (r.left + r.width / 2 - cx) * p;
      cy += (r.top + r.height / 2 - cy) * p;
      s += (ts - s) * p;
    }
    medal.style.transform = `translate3d(${(cx - base / 2).toFixed(1)}px,${(cy - base / 2).toFixed(1)}px,0) scale(${(s / base).toFixed(4)})`;
    return cy + s / 2 > -50 && cy - s / 2 < innerHeight + 50;
  };

  let running = false, t0 = performance.now();
  const frame = now => {
    if(!running) return;
    const t = (now - t0) / 1000;
    const p = smoothstep(clamp01(state.travel));
    const free = 1 - p;                                     /* le suivi du pointeur s'efface pendant le trajet */
    const swing = (reduce ? 0 : state.sway) * (1 - .6 * p);   /* il continue de respirer doucement une fois posé */
    pivot.rotation.set(
      D(state.rotationX + state.tiltX * free) + Math.sin(t * .7) * .03 * swing + D(Math.sin(p * Math.PI) * 14),
      D(state.rotationY + state.tiltY * free + state.spinIn + p * 360),   /* un tour complet qui suit le scroll */
      Math.sin(t * .9) * .02 * swing
    );
    sweep.position.x = state.sweep * 3;
    sweep.intensity = state.sweep > -1 && state.sweep < 1 ? 40 * (1 - Math.abs(state.sweep)) : 0;
    /* niveau du liquide : surface qui ondule doucement tant qu'il monte */
    const f = clamp01(state.fill);
    mold.visible = f < 1;
    if(f >= 1){ cutLiquid.constant = 1e3; }
    else{
      const wob = (1 - f) * .07;
      nrm.set(Math.sin(t * 2.3) * wob, -1, Math.sin(t * 1.7 + 1) * wob * .6).normalize();
      const level = lowY + (highY - lowY) * f;
      cutLiquid.normal.copy(nrm); cutLiquid.constant = level * -nrm.y;          /* garde ce qui est sous le niveau */
      cutMold.normal.copy(nrm).negate(); cutMold.constant = -cutLiquid.constant;
    }
    if(place(p)) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  const start = () => { if(!running && !document.hidden){ running = true; requestAnimationFrame(frame); } };
  const stop = () => { running = false; };

  host.classList.add("is-3d");
  fit();
  new ResizeObserver(fit).observe(host);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  place(0);
  renderer.render(scene, camera);
  start();

  window.Pendant = {state};
}

/* ---------- Médaillon sur les autres pages ----------
   data-medal="drag"   : pièce mise en avant (hero) → arrive en tournant, se fait tourner à la main.
   data-medal="scroll" : médaillon en fond, derrière un texte ou une image → tourne sur lui-même au fil du scroll, sans interaction. */
function initSimple(el, mode){
  const {renderer, canvas, scene, camera, pivot, sweep, box, centerY} = buildMedal();
  canvas.className = "medal-canvas";
  el.append(canvas);
  el.classList.add("is-3d");
  const D = THREE.MathUtils.degToRad;

  const fit = () => {
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfH = (box[3] - box[1]) / 2 + .08, halfW = (box[2] - box[0]) / 2 + .08;
    const t = Math.tan(D(camera.fov / 2));
    const dist = Math.max(halfH / t, halfW / (t * camera.aspect)) + .12;
    camera.position.set(0, centerY, dist);
    camera.lookAt(0, centerY, 0);
    camera.updateProjectionMatrix();
  };

  /* Rotation à la main (mode drag) : même comportement que sur l'accueil, avec retour de face */
  let rotY = 0, rotX = 0, tgtY = 0, tgtX = 0, down = false, sx = 0, sy = 0, bx = 0, by = 0, lx = 0, lt = 0, vel = 0;
  if(mode === "drag"){
    el.style.touchAction = "pan-y"; el.style.cursor = "grab";
    el.addEventListener("pointerdown", e => {
      if(e.button !== 0) return;
      down = true; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing";
      sx = lx = e.clientX; sy = e.clientY; bx = tgtY = rotY; by = tgtX = rotX; lt = performance.now(); vel = 0;
    });
    el.addEventListener("pointermove", e => {
      if(!down) return;
      tgtY = bx + (e.clientX - sx) * .55;
      tgtX = Math.max(-40, Math.min(40, by - (e.clientY - sy) * .3));
      const now = performance.now(); vel = vel * .6 + ((e.clientX - lx) * .55 / Math.max(1, now - lt)) * .4; lx = e.clientX; lt = now;
    });
    const release = e => {
      if(!down) return; down = false; el.style.cursor = "grab";
      if(el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if(performance.now() - lt > 120) vel = 0;
      tgtY = Math.round((tgtY + Math.max(-900, Math.min(900, vel * 420))) / 360) * 360; tgtX = 0;
    };
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
  }

  const t0 = performance.now();
  const intro = mode === "drag" && !reduce ? 2600 : 0;          /* arrivée en tournant, comme sur l'accueil */
  let running = false, visible = true;
  const frame = now => {
    if(!running) return;
    const t = (now - t0) / 1000;
    if(mode === "scroll"){
      /* un demi-tour par hauteur d'écran défilée */
      pivot.rotation.set(Math.sin(t * .5) * .02, D(scrollY / innerHeight * 180), 0);
    }else{
      const k = intro ? Math.min(1, (now - t0) / intro) : 1, e = k >= 1 ? 1 : 1 - Math.pow(2, -10 * k);
      rotY += (tgtY - rotY) * (down ? .25 : .06); rotX += (tgtX - rotX) * .15;
      if(!down && Math.abs(tgtY - rotY) < .05 && tgtY % 360 === 0 && tgtY !== 0){ rotY = tgtY = 0; }
      const swing = reduce ? 0 : 1;
      pivot.rotation.set(D(rotX) + Math.sin(t * .7) * .03 * swing, D(rotY - 200 * (1 - e)), Math.sin(t * .9) * .02 * swing);
      const sw = intro ? Math.min(1, Math.max(0, (now - t0 - 900) / 1600)) * 2 - 1 : 1;    /* reflet qui balaie le métal */
      sweep.position.x = sw * 3; sweep.intensity = sw > -1 && sw < 1 ? 40 * (1 - Math.abs(sw)) : 0;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  const start = () => { if(!running && visible && !document.hidden){ running = true; requestAnimationFrame(frame); } };
  const stop = () => { running = false; };
  fit();
  new ResizeObserver(fit).observe(el);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }).observe(el);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  renderer.render(scene, camera);
  start();
}
/* ---------- Le médaillon lui-même : rendu, studio de reflets, argent, formes du logo ---------- */
function buildMedal(){
  /* ---------- Rendu ---------- */
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = "pendant-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 50);

  /* ---------- Studio : environnement de reflets (boîtes lumineuses) ---------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene();
  studio.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({color:0x4d5562, side:THREE.BackSide})));
  const panel = (w, h, color, power, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(power), side:THREE.DoubleSide}));
    m.position.set(...pos); m.lookAt(0, 0, 0); studio.add(m);
  };
  panel(10, 6, 0xeef2f8, 2.2, [0, 1.6, 5.9]);     // grande boîte à lumière de face : le chrome devient argent
  panel(10, 2.4, 0xffffff, 4, [0, 5.9, 1]);       // plafond
  panel(1.2, 8, 0xffffff, 8, [-5.9, 0, 2]);       // bande verticale gauche (arêtes brillantes)
  panel(.9, 8, 0xffffff, 6, [5.9, .5, 0]);        // bande verticale droite
  panel(12, 3.2, 0x0b1424, 1, [0, -5.9, 1.5]);    // sol bleu nuit : reflets sombres en bas, comme le rendu
  panel(1.6, 1.6, 0xffffff, 14, [-3.4, 3.6, 4.4]);// point brillant
  panel(6, 6, 0x7d8796, 1, [0, 0, -5.9]);         // fond
  const envTex = pmrem.fromScene(studio, .03).texture;
  scene.environment = envTex;

  /* ---------- Matière : un seul argent poli, comme une pièce coulée d'un bloc ---------- */
  const silver = new THREE.MeshPhysicalMaterial({color:0xe4e7ec, metalness:1, roughness:.17, clearcoat:.25, clearcoatRoughness:.12, envMapIntensity:1.1});

  /* ---------- Formes ---------- */
  const toShape = s => {
    const pts = a => { const v = []; for(let i = 0; i < a.length; i += 2) v.push(new THREE.Vector2(a[i], a[i + 1])); return v; };
    const sh = new THREE.Shape(pts(s.o));
    (s.h || []).forEach(h => sh.holes.push(new THREE.Path(pts(h))));
    return sh;
  };
  const pieceShapes = window.LOGO_SHAPES.map(toShape);

  /* Chaque forme du logo devient un bloc d'argent aux bords arrondis.
     Les espaces du logo d'origine restent vides : on voit à travers. */
  const DEPTH = .05, BEVEL = .03;
  const geo = smooth(new THREE.ExtrudeGeometry(pieceShapes, {depth:DEPTH, bevelEnabled:true, bevelThickness:BEVEL, bevelSize:.009, bevelSegments:7, curveSegments:2}));
  geo.translate(0, 0, -DEPTH / 2);
  const piece = new THREE.Group();
  piece.add(new THREE.Mesh(geo, silver));
  /* Pivot au centre du logo */
  const box = window.LOGO_SHAPES_BOX;            // [minx, miny, maxx, maxy, ...]
  const centerY = (box[1] + box[3]) / 2;
  const pivot = new THREE.Group();
  piece.position.y = -centerY;
  pivot.position.y = centerY;
  pivot.add(piece);
  scene.add(pivot);

  /* Lumière qui balaie l'argent (reflet de l'intro) */
  const sweep = new THREE.PointLight(0xffffff, 0, 6, 1.5);
  sweep.position.set(-3, .4, 2.2);
  scene.add(sweep);
  return {renderer, canvas, scene, camera, pivot, piece, sweep, box, centerY, silver, geo};
}

/* Normales lissées sur les biseaux, arêtes vives conservées (angle > 55°) */
function smooth(geo){
  const pos = geo.attributes.position, n = pos.count;
  const fn = new Float32Array(n * 3), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for(let i = 0; i < n; i += 3){
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    const nn = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    for(let k = 0; k < 3; k++){ fn[(i + k) * 3] = nn.x; fn[(i + k) * 3 + 1] = nn.y; fn[(i + k) * 3 + 2] = nn.z; }
  }
  const key = i => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  const groups = new Map();
  for(let i = 0; i < n; i++){ const k = key(i); let g = groups.get(k); if(!g) groups.set(k, g = []); g.push(i); }
  const out = new Float32Array(n * 3), cos = Math.cos(THREE.MathUtils.degToRad(55));
  groups.forEach(g => {
    for(const i of g){
      let x = 0, y = 0, z = 0;
      for(const j of g){
        const d = fn[i*3]*fn[j*3] + fn[i*3+1]*fn[j*3+1] + fn[i*3+2]*fn[j*3+2];
        if(d >= cos){ x += fn[j*3]; y += fn[j*3+1]; z += fn[j*3+2]; }
      }
      const l = Math.hypot(x, y, z) || 1;
      out[i*3] = x / l; out[i*3+1] = y / l; out[i*3+2] = z / l;
    }
  });
  geo.setAttribute("normal", new THREE.BufferAttribute(out, 3));
  return geo;
}
