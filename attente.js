/* BDE CESI Lille — page d'attente : compte à rebours, pull en pixels floutés, accès équipe par code.
   Le code n'est écrit nulle part : on compare son empreinte PBKDF2 (300 000 tours, lente à calculer exprès)
   à celle enregistrée ci-dessous. Le jeton gardé dans le navigateur est cette empreinte (voir boot.js).
   Limite : sur un site statique, ceci cache le site au public mais ne remplace pas une vraie authentification. */
(function(){
"use strict";
const OUVERTURE = 1795505400000;                       /* mardi 24 novembre 2026, 8 h 30 (Paris) */
const DEBUT = 1795100000000;                           /* mise en ligne de la page d'attente : pixels les plus gros */
const EMPREINTE = "0596365f95335e86bf7c7678507404a6215dee8b839923a146de952866565c68";
const SEL = "bde-cesi-lille|acces|2026", TOURS = 300000;
const $ = s => document.querySelector(s);

/* page demandée avant la redirection : uniquement une page du site (pas d'adresse extérieure) */
const suite = (() => { const s = new URLSearchParams(location.search).get("suite") || "";
  return /^[\w-]+\.html(#[\w-]*)?$/.test(s) ? s : "index.html"; })();
const entrer = () => location.replace(suite);

/* ---------- Compte à rebours ---------- */
const pad = n => String(n).padStart(2, "0");
const tick = () => {
  const r = Math.max(0, OUVERTURE - Date.now());
  if(r <= 0){ entrer(); return; }                      /* c'est l'heure : on ouvre le site */
  const s = Math.floor(r / 1000);
  $("#cdD").textContent = Math.floor(s / 86400);
  $("#cdH").textContent = pad(Math.floor(s / 3600) % 24);
  $("#cdM").textContent = pad(Math.floor(s / 60) % 60);
  $("#cdS").textContent = pad(s % 60);
  draw();
};

/* ---------- Pull en mosaïque de pixels (de plus en plus fine jusqu'à l'ouverture) ---------- */
const cv = $("#wtPixels"), cx = cv.getContext("2d"), small = document.createElement("canvas"), sx = small.getContext("2d");
const img = new Image(); let ready = false, lastN = 0;
img.onload = () => { ready = true; lastN = 0; draw(); };
img.src = "images/pieces/pull-noir-dos.png";
function draw(){
  if(!ready) return;
  const k = Math.min(1, Math.max(0, (Date.now() - DEBUT) / (OUVERTURE - DEBUT)));
  const n = Math.round(34 + k * k * 46);               /* 34 pixels de large au début (on reconnaît le pull), 80 juste avant l'ouverture */
  if(n === lastN) return; lastN = n;
  small.width = small.height = n;
  sx.clearRect(0, 0, n, n); sx.drawImage(img, 0, 0, n, n);
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.imageSmoothingEnabled = false;
  cx.drawImage(small, 0, 0, cv.width, cv.height);
}

tick(); setInterval(tick, 1000);

/* ---------- Accès équipe ---------- */
/* ---------- Fond : grille fixe de grands carrés presque noirs ----------
   Les lignes autour des carrés s'illuminent doucement, de proche en proche :
   - ordinateur (souris) : la case sous le curseur s'allume (traîne douce), un clic gauche lance une vague ;
   - téléphone / tablette : des vagues douces qui partent d'un point au hasard et s'éteignent avant de couvrir l'écran.
   Si l'utilisateur demande moins d'animations, la grille reste immobile. */
(() => {
  const bg = $("#wtBg"); if(!bg) return;
  const g = bg.getContext("2d");
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const souris = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const PAS = souris ? 64 : 48, ESP = 2;               /* taille d'une case et épaisseur des lignes (px) */
  const LIGNE = "#0c0c0e";                              /* couleur des lignes au repos */
  let W = 0, H = 0, cols = 0, rows = 0, ox = 0, oy = 0, base, lum;
  const taille = () => {
    const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    bg.width = W * dpr; bg.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / PAS) + 1; rows = Math.ceil(H / PAS) + 1;
    ox = (W - cols * PAS) / 2; oy = (H - rows * PAS) / 2;  /* grille centrée */
    const n = cols * rows;
    base = new Float32Array(n); lum = new Float32Array(n);
    for(let i = 0; i < n; i++) base[i] = 22 + Math.random() * 8;   /* presque noir, pas noir, nuances proches */
    dessine();
  };
  function dessine(){
    g.fillStyle = LIGNE; g.fillRect(0, 0, W, H);
    const t = PAS - ESP;
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      const i = r * cols + c, v = Math.round(base[i] + lum[i] * 9);     /* allumé : à peine plus clair */
      g.fillStyle = `rgb(${v},${v},${v + 2})`;
      g.fillRect(ox + c * PAS + ESP / 2, oy + r * PAS + ESP / 2, t, t);
    }
    g.lineWidth = ESP; g.shadowColor = "rgba(190,205,255,.8)";
    for(let i = 0; i < lum.length; i++){
      if(lum[i] <= .03) continue;
      const c = i % cols, r = (i / cols) | 0;
      g.shadowBlur = 12 * lum[i];
      g.strokeStyle = `rgba(225,232,255,${(lum[i] * .7).toFixed(3)})`;
      g.strokeRect(ox + c * PAS, oy + r * PAS, PAS, PAS);
    }
    g.shadowBlur = 0;
  }

  /* source de lumière (ordinateur) : suit le curseur en douceur */
  const cible = {x: 0, y: 0, on: false}, lueur = {x: 0, y: 0, a: 0};
  /* vagues (téléphone) : anneaux qui s'élargissent depuis un point au hasard, jamais dans une autre vague
     ni derrière le pull ; elles glissent lentement et rebondissent quand elles se touchent */
  const vagues = []; let prochaine = 0;
  const pull = document.getElementById("wtPixels");
  function point(){
    const z = pull ? pull.getBoundingClientRect() : null;
    for(let essai = 0; essai < 12; essai++){
      const x = Math.random() * W, y = Math.random() * H;
      if(z && x > z.left - 20 && x < z.right + 20 && y > z.top - 20 && y < z.bottom + 20) continue;
      if(vagues.some(w => Math.hypot(x - w.x, y - w.y) < w.r + PAS)) continue;
      const a = Math.random() * 6.283, v = .35 + Math.random() * .3;
      return {x, y, r: 0, max: 180 + Math.random() * 160, vx: Math.cos(a) * v, vy: Math.sin(a) * v};
    }
    return null;                                        /* pas de place libre : on attend la prochaine */
  }

  function intensite(x, y){
    let v = 0;
    if(souris && lueur.a > .01 && Math.abs(x - cible.x) < PAS / 2 && Math.abs(y - cible.y) < PAS / 2) v = lueur.a;   /* seulement la case sous le curseur */
    for(const w of vagues){
      const d = Math.hypot(x - w.x, y - w.y), e = Math.abs(d - w.r), L = PAS * 1.3;
      if(e < L){ const k = 1 - e / L; v = Math.max(v, k * k * (1 - w.r / w.max)); }
    }
    return v;
  }
  function pas(now){
    if(souris){
      lueur.a += ((cible.on ? 1 : 0) - lueur.a) * .05;
      lueur.x += (cible.x - lueur.x) * .12; lueur.y += (cible.y - lueur.y) * .12;
    }else if(now > prochaine){                          /* téléphone : nouvelle vague toutes les 2,5 à 4,5 s */
      const p = point(); if(p) vagues.push(p);
      prochaine = now + 2500 + Math.random() * 2000;
    }
    {                                                   /* vagues (téléphone, ou clic sur ordinateur) */
      const VIT = souris ? 2 : 1;                       /* vagues deux fois plus rapides sur ordinateur */
      for(const w of vagues){ w.r += 1.2 * VIT; w.x += w.vx * VIT; w.y += w.vy * VIT; }   /* s'élargit et glisse lentement */
      /* deux vagues qui se touchent rebondissent l'une sur l'autre (comme deux billes) */
      for(let a = 0; a < vagues.length; a++) for(let b = a + 1; b < vagues.length; b++){
        const A = vagues[a], B = vagues[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
        if(d >= A.r + B.r) continue;
        const nx = dx / d, ny = dy / d, rel = (A.vx - B.vx) * nx + (A.vy - B.vy) * ny;
        if(rel > 0){ A.vx -= rel * nx; A.vy -= rel * ny; B.vx += rel * nx; B.vy += rel * ny; }
      }
      for(let k = vagues.length - 1; k >= 0; k--) if(vagues[k].r >= vagues[k].max) vagues.splice(k, 1);
    }
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      const i = r * cols + c, t = intensite(ox + (c + .5) * PAS, oy + (r + .5) * PAS);
      lum[i] += (t - lum[i]) * (t > lum[i] ? .08 : .03);   /* s'allume doucement, s'éteint encore plus doucement */
    }
    dessine(); requestAnimationFrame(pas);
  }
  taille(); addEventListener("resize", taille);
  if(calme) return;
  if(souris){
    addEventListener("pointermove", e => {
      cible.x = e.clientX; cible.y = e.clientY;
      if(!cible.on){ cible.on = true; if(lueur.a < .02){ lueur.x = cible.x; lueur.y = cible.y; } }
    }, {passive: true});
    document.documentElement.addEventListener("pointerleave", () => { cible.on = false; });
    /* clic sur le fond : une vague de taille aléatoire part du point cliqué */
    addEventListener("click", e => {                    /* clic gauche uniquement (le clic droit ne fait rien) */
      if(e.button !== 0 || e.target.closest("button, a, input, form, .wt-count")) return;
      const a = Math.random() * 6.283, v = .2 + Math.random() * .3;
      vagues.push({x: e.clientX, y: e.clientY, r: 0, max: 100 + Math.random() * 320, vx: Math.cos(a) * v, vy: Math.sin(a) * v});
    });
  }
  requestAnimationFrame(pas);
})();

/* ---------- Rappel dans l'agenda ---------- */
/* iPhone, iPad et Mac : le fichier rappel.ics s'ouvre dans Calendrier avec « Ajouter » ;
   ailleurs (Android, Windows…) : la création d'événement de Google Agenda, déjà remplie */
const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
if(apple){ const c = $("#wtCal"); c.href = "rappel.ics"; c.removeAttribute("target"); c.type = "text/calendar"; }

/* le champ du code est caché : un appui sur le pull le fait apparaître ou disparaître */
const btn = $("#wtTeam"), form = $("#wtForm"), input = $("#wtCode"), msg = $("#wtMsg"), go = $("#wtGo");
btn.addEventListener("click", () => {
  const open = form.hidden; form.hidden = !open; btn.setAttribute("aria-expanded", open); form.parentElement.classList.toggle("code", open);
  if(open){ input.focus(); form.scrollIntoView({block:"nearest"}); }
});
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
async function empreinte(code){
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt:enc.encode(SEL), iterations:TOURS}, key, 256));
}
/* le message s'affiche dans le champ lui-même (texte d'attente), pour ne rien chevaucher ; lu aussi par les lecteurs d'écran */
function dire(t, etat){
  msg.textContent = t; msg.className = "wt-msg" + (etat ? " " + etat : "");
  input.value = ""; input.placeholder = t; form.dataset.etat = etat;
}
input.addEventListener("input", () => { if(input.placeholder !== "Code"){ input.placeholder = "Code"; form.dataset.etat = ""; } });
let essais = 0, bloqueJusqua = 0;
form.addEventListener("submit", async e => {
  e.preventDefault();
  if(Date.now() < bloqueJusqua){ dire("Trop d'essais, patiente…", "bad"); return; }
  const code = input.value.trim().toUpperCase();
  if(!code) return;
  go.disabled = true; dire("Vérification…", "");
  let ok = false;
  try{ ok = (await empreinte(code)) === EMPREINTE; }catch(err){ dire("Navigateur non compatible", "bad"); go.disabled = false; return; }
  if(ok){
    try{ sessionStorage.setItem("bde-acces", EMPREINTE); }catch(err){}
    dire("Bienvenue !", "ok");
    setTimeout(entrer, 400);
  }else{
    essais++; input.value = ""; go.disabled = false;
    dire("Code incorrect", "bad");
    form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
    if(essais >= 5){ bloqueJusqua = Date.now() + 30000; essais = 0; }   /* freine les essais en rafale */
  }
});
})();
