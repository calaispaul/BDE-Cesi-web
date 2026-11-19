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
/* ---------- Fond : petits carrés gris qui montent ----------
   Ordinateur (souris) : les carrés s'écartent du curseur. Téléphone / tablette : petites rafales aléatoires.
   Si l'utilisateur demande moins d'animations, les carrés restent immobiles. */
(() => {
  const bg = $("#wtBg"); if(!bg) return;
  const g = bg.getContext("2d");
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const souris = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let W = 0, H = 0, dpr = 1, carres = [];
  const mx = {x: -1e4, y: -1e4};
  const nouveau = (y) => {
    const t = 4 + Math.random() * 12;                    /* côté : 4 à 16 px */
    const gris = Math.round(120 + Math.random() * 95);   /* nuance de gris */
    return {x: Math.random() * W, y: y ?? Math.random() * H, t, c: `rgba(${gris},${gris},${gris + 3},${(.35 + Math.random() * .45).toFixed(2)})`,
      v: .15 + Math.random() * .45 + t * .02, ph: Math.random() * 6.28, f: .004 + Math.random() * .01, a: Math.random() * 6.28,
      va: (Math.random() - .5) * .01, dx: 0, dy: 0};
  };
  const taille = () => {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    bg.width = W * dpr; bg.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(160, Math.round(W * H / 8000));
    while(carres.length < n) carres.push(nouveau());
    carres.length = n;
  };
  const dessine = () => {
    g.clearRect(0, 0, W, H);
    for(const q of carres){
      g.save(); g.translate(q.x + Math.sin(q.ph) * 6, q.y); g.rotate(q.a);
      g.fillStyle = q.c; g.fillRect(-q.t / 2, -q.t / 2, q.t, q.t); g.restore();
    }
  };
  const pas = () => {
    for(const q of carres){
      if(souris){                                        /* le curseur repousse les carrés proches */
        const ex = q.x - mx.x, ey = q.y - mx.y, d2 = ex * ex + ey * ey, R = 150;
        if(d2 < R * R){ const d = Math.sqrt(d2) || 1, k = (1 - d / R) * 1.6; q.dx += ex / d * k; q.dy += ey / d * k; }
      }else if(Math.random() < .002){                    /* rafale aléatoire */
        q.dx += (Math.random() - .5) * 4; q.dy -= Math.random() * 2;
      }
      q.dx *= .93; q.dy *= .93;
      q.x += q.dx; q.y += q.dy - q.v; q.ph += q.f; q.a += q.va + q.dx * .01;
      if(q.y < -20){ Object.assign(q, nouveau(H + 20)); }
      if(q.x < -20) q.x = W + 20; else if(q.x > W + 20) q.x = -20;
    }
    dessine(); requestAnimationFrame(pas);
  };
  taille(); addEventListener("resize", taille);
  if(souris){
    addEventListener("pointermove", e => { mx.x = e.clientX; mx.y = e.clientY; }, {passive: true});
    document.addEventListener("pointerleave", () => { mx.x = mx.y = -1e4; });
  }
  if(calme) dessine(); else requestAnimationFrame(pas);
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
