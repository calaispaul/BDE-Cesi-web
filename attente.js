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
/* ---------- Fond : grille fixe de petits carrés ----------
   Ordinateur (souris) : les carrés sous le curseur foncent en gris puis reviennent doucement.
   Téléphone / tablette : des carrés changent au hasard entre le gris clair et le blanc.
   Si l'utilisateur demande moins d'animations, la grille reste immobile. */
(() => {
  const bg = $("#wtBg"); if(!bg) return;
  const g = bg.getContext("2d");
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const souris = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const PAS = souris ? 30 : 26, ESP = 3;               /* taille d'une case et espace entre les cases (px) */
  const clair = () => 232 + Math.random() * 23;         /* nuance entre gris clair (232) et blanc (255) */
  let W = 0, H = 0, cols = 0, rows = 0, ox = 0, oy = 0, base, cur, chaud, actif = false;
  const taille = () => {
    const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    bg.width = W * dpr; bg.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / PAS) + 1; rows = Math.ceil(H / PAS) + 1;
    ox = (W - cols * PAS) / 2; oy = (H - rows * PAS) / 2;  /* grille centrée */
    const n = cols * rows;
    base = new Float32Array(n); cur = new Float32Array(n); chaud = new Float32Array(n);
    for(let i = 0; i < n; i++){ base[i] = cur[i] = clair(); }
    dessine(); reveille();
  };
  function dessine(){
    g.clearRect(0, 0, W, H);
    const t = PAS - ESP;
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      const i = r * cols + c, v = Math.round(cur[i] - chaud[i] * 70);   /* survolé : jusqu'à 70 tons plus foncé */
      g.fillStyle = `rgb(${v},${v},${Math.min(255, v + 2)})`;
      g.fillRect(ox + c * PAS, oy + r * PAS, t, t);
    }
  }
  function pas(){
    let bouge = false;
    const n = cols * rows;
    if(!souris){                                        /* quelques cases changent de nuance au hasard */
      for(let k = 0; k < Math.max(1, n / 300); k++) base[(Math.random() * n) | 0] = clair();
    }
    for(let i = 0; i < n; i++){
      const d = base[i] - cur[i];
      if(Math.abs(d) > .3){ cur[i] += d * .06; bouge = true; } else cur[i] = base[i];
      if(chaud[i] > .004){ chaud[i] *= .94; bouge = true; } else chaud[i] = 0;
    }
    dessine();
    if(bouge || !souris) requestAnimationFrame(pas); else actif = false;
  }
  function reveille(){ if(!calme && !actif){ actif = true; requestAnimationFrame(pas); } }
  taille(); addEventListener("resize", taille);
  if(souris && !calme){
    addEventListener("pointermove", e => {
      const c = Math.floor((e.clientX - ox) / PAS), r = Math.floor((e.clientY - oy) / PAS);
      for(let dr = -1; dr <= 1; dr++) for(let dc = -1; dc <= 1; dc++){   /* la case survolée et un halo autour */
        const rr = r + dr, cc = c + dc; if(rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
        const i = rr * cols + cc, k = (dr || dc) ? .35 : 1;
        if(chaud[i] < k) chaud[i] = k;
      }
      reveille();
    }, {passive: true});
  }
})();

/* ---------- Rappel dans l'agenda ---------- */
/* iPhone, iPad et Mac : le fichier rappel.ics s'ouvre dans Calendrier avec « Ajouter » ;
   ailleurs (Android, Windows…) : la création d'événement de Google Agenda, déjà remplie */
const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
if(apple){ const c = $("#wtCal"); c.href = "rappel.ics"; c.removeAttribute("target"); c.type = "text/calendar"; }

/* le champ du code est caché : un appui sur le logo du BDE (en bas) le fait apparaître ou disparaître */
const btn = $("#wtTeam"), form = $("#wtForm"), input = $("#wtCode"), msg = $("#wtMsg"), go = $("#wtGo");
btn.addEventListener("click", () => {
  const open = form.hidden; form.hidden = !open; btn.setAttribute("aria-expanded", open);
  if(open){ input.focus(); form.scrollIntoView({block:"nearest"}); }
});
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
async function empreinte(code){
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt:enc.encode(SEL), iterations:TOURS}, key, 256));
}
let essais = 0, bloqueJusqua = 0;
form.addEventListener("submit", async e => {
  e.preventDefault();
  if(Date.now() < bloqueJusqua){ msg.textContent = "Trop d'essais : patiente quelques secondes."; return; }
  const code = input.value.trim().toUpperCase();
  if(!code) return;
  go.disabled = true; msg.textContent = "Vérification…"; msg.className = "wt-msg";
  let ok = false;
  try{ ok = (await empreinte(code)) === EMPREINTE; }catch(err){ msg.textContent = "Ton navigateur ne permet pas la vérification."; go.disabled = false; return; }
  if(ok){
    try{ sessionStorage.setItem("bde-acces", EMPREINTE); }catch(err){}
    msg.textContent = "Bienvenue !"; msg.className = "wt-msg ok";
    setTimeout(entrer, 400);
  }else{
    essais++; input.value = ""; go.disabled = false;
    msg.textContent = "Code incorrect."; msg.className = "wt-msg bad";
    form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
    if(essais >= 5){ bloqueJusqua = Date.now() + 30000; essais = 0; }   /* freine les essais en rafale */
  }
});
})();
