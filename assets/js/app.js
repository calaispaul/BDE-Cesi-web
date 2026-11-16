/* CESI Lille – affichage du catalogue. Réglages dans products.js */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const eur = n => n.toLocaleString("fr-FR", {style:"currency", currency:"EUR"});
const priceOf = p => p.price ? eur(p.price) : "Prix bientôt annoncé";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ERR = '<p class="sub">Un problème est survenu. Rechargez la page ou écrivez-nous.</p>';

if(typeof SHOP === "undefined" || typeof PRODUCTS === "undefined"){
  ["#newGrid", "#shopRoot"].forEach(s => { const e = $(s); if(e) e.innerHTML = ERR; });
  return;
}
const prod = id => PRODUCTS.find(p => p.id === id);
const colOf = (p, cid) => p.colors.find(c => c.id === cid) || p.colors[0];
const closed = () => !!SHOP.preorderEnd && new Date(SHOP.preorderEnd + "T23:59:59") < new Date();
const endLabel = () => SHOP.preorderEnd ? new Date(SHOP.preorderEnd + "T12:00:00").toLocaleDateString("fr-FR", {day:"numeric", month:"long"}) : "";
/* Seules les adresses https valides sont acceptées (ni javascript:, ni http:, ni identifiants dans l'adresse) */
const buyUrl = p => {
  const raw = (p && p.buyUrl) || SHOP.shopUrl || SHOP.helloAssoUrl || "";
  try{
    const u = new URL(raw), th = SHOP.trustedHosts || [];
    if(u.protocol !== "https:" || u.username || u.password) return "";
    if(th.length && !th.some(h => u.hostname === h || u.hostname.endsWith("." + h))) return "";
    return u.href;
  }catch(e){ return ""; }
};
function buyButton(p){
  if(closed()) return '<button class="btn" type="button" disabled>Précommandes terminées</button>';
  const u = buyUrl(p);
  return u ? `<a class="btn" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(SHOP.payLabel || "Précommander")}</a>`
           : '<button class="btn" type="button" disabled>Précommandes bientôt ouvertes</button>';
}
const dots = p => p.colors.length > 1 ? `<div class="dots">${p.colors.map(c => `<i title="${esc(c.name)}" style="background:${esc(c.hex)}"></i>`).join("")}</div>` : "";
function card(p){
  const im = p.colors[0].images, href = "boutique.html?p=" + encodeURIComponent(p.id);
  return `<article class="pcard"><a class="swap" href="${href}" aria-label="Voir ${esc(p.name)}"><span class="badge">New in</span><img src="${esc(im[0].src)}" alt="${esc(im[0].alt)}" loading="lazy" decoding="async">${im[1] ? `<img src="${esc(im[1].src)}" alt="${esc(im[1].alt)}" loading="lazy" decoding="async">` : ""}</a><h3>${esc(p.name)}</h3><p class="price">${priceOf(p)}</p>${dots(p)}<a class="btn inl" href="${href}">Voir le produit</a></article>`;
}

function renderShop(){
  const root = $("#shopRoot");
  const qs = new URLSearchParams(location.search);
  let p = prod(qs.get("p") || document.body.dataset.product);
  if(!p && PRODUCTS.length === 1) p = PRODUCTS[0];
  if(!p){ root.innerHTML = `<div class="sec-head"><h1 class="h">Boutique</h1></div><div class="pgrid">${PRODUCTS.map(card).join("")}</div>`; return; }
  document.title = p.name;
  let color = colOf(p, qs.get("c")).id;
  const guide = p.guide ? `<details id="guide"><summary>Guide des tailles</summary><p>Mesures du vêtement posé à plat. Coupe oversize : prenez votre taille habituelle, ou une taille en dessous pour un rendu plus ajusté.${p.guideNote ? " " + esc(p.guideNote) : ""}</p><ul>${p.sizes.map(s => `<li>${esc(s)} : ${esc(p.guide[s] || "")}</li>`).join("")}</ul></details>` : "";
  const tag = SHOP.preorderEnd ? (closed() ? "Précommandes terminées" : "Précommande jusqu'au " + endLabel()) : (p.tag || "Précommande");
  root.innerHTML = `<div class="viewer"><button type="button" class="stage" id="stage" aria-label="Agrandir l'image"><img id="stageImg" alt="" width="2400" height="1792"></button><div class="thumbs" id="thumbs"></div></div>
  <div class="info" id="infos"><h1>${esc(p.name)}</h1><p class="price">${priceOf(p)}</p><span class="tag">${esc(tag)}</span><p class="lead">${esc(p.desc)}</p>
    ${p.colors.length > 1 ? `<div class="row"><span>Couleur : <b id="colName">${esc(colOf(p, color).name)}</b></span></div><div class="swatches" role="radiogroup" aria-label="Couleur">${p.colors.map((c, k) => `<button type="button" class="sw${c.id === color ? " on" : ""}" role="radio" aria-checked="${c.id === color}" data-c="${esc(c.id)}" aria-label="${esc(c.name)}" title="${esc(c.name)}"><i style="background:${esc(c.hex)}"></i></button>`).join("")}</div>` : ""}
    <div class="row"><span>Tailles</span></div><div class="chips">${p.sizes.map(s => `<span>${esc(s)}</span>`).join("")}</div>
    <p class="note">La taille${p.colors.length > 1 ? " et la couleur se choisissent" : " se choisit"} sur la page de précommande.${SHOP.payNote ? " " + esc(SHOP.payNote) : ""}</p>
    <div class="buy">${buyButton(p)}</div>
    <ol class="steps"><li>Choisis ta taille sur la page de précommande et règle par carte.</li><li>Tu reçois une confirmation de commande par e-mail.</li><li>La production démarre à la fin des précommandes.</li><li>Retrait sur le campus de Lille à la date annoncée.</li></ol>
    <div class="acc">${guide}${p.material ? `<details><summary>Matière et entretien</summary><p>${esc(p.material)}</p></details>` : ""}
      <details><summary>Retrait et conditions</summary><p>Retrait uniquement sur le campus de Lille, à la date communiquée par e-mail. Pas de livraison. Série unique, sans réédition. Voir les <a class="more" style="margin:0" href="infos-legales.html#cgv">conditions de vente</a>.</p></details></div></div>`;
  const stage = $("#stage"), img = $("#stageImg");
  const show = (i, fade) => { const x = colOf(p, color).images[i]; stage.dataset.zoom = x.src;
    const set = () => { img.onload = () => { img.style.opacity = 1; }; img.src = x.src; img.alt = x.alt; if(img.complete) img.style.opacity = 1; };
    if(fade){ img.style.opacity = 0; setTimeout(set, 200); } else set(); };
  const thumbs = () => { $("#thumbs").innerHTML = colOf(p, color).images.map((x, i) => `<button type="button" class="th${i ? "" : " on"}" data-i="${i}" aria-label="Image ${i + 1}"><img src="${esc(x.thumb)}" alt="" width="200" height="200" loading="lazy"></button>`).join(""); show(0); };
  thumbs();
  $("#thumbs").onclick = e => { const t = e.target.closest(".th"); if(!t) return; $$(".th").forEach(x => x.classList.toggle("on", x === t)); show(+t.dataset.i, true); };
  const sw = $(".swatches");
  if(sw) sw.onclick = e => { const b = e.target.closest(".sw"); if(!b) return; color = b.dataset.c;
    $$(".sw").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
    $("#colName").textContent = colOf(p, color).name; thumbs(); };
}

const run = (fn, sel) => { try { fn(); } catch(e){ console.error(e); const el = $(sel); if(el) el.innerHTML = ERR; } };
if($("#newGrid")) run(() => { $("#newGrid").innerHTML = PRODUCTS.map(card).join(""); }, "#newGrid");
if($("#shopRoot")) run(renderShop, "#shopRoot");

/* Réglages appliqués à toute la page */
/* Le panier de l'en-tête renvoie vers la boutique de paiement (si elle est configurée et ouverte) */
const cartEl = $("[data-cart]");
if(cartEl && !closed()){
  const u = buyUrl(PRODUCTS[0]);
  if(u){ cartEl.href = u; cartEl.target = "_blank"; cartEl.rel = "noopener noreferrer"; cartEl.setAttribute("aria-label", "Panier : ouvrir la boutique de paiement"); }
}
$$("[data-mail]").forEach(a => { a.href = "mailto:" + SHOP.contactEmail; });

/* Agrandissement des images */
document.body.insertAdjacentHTML("beforeend", '<div class="lb" id="lb" role="dialog" aria-label="Image agrandie"><button type="button" aria-label="Fermer">×</button><img alt=""></div>');
const lb = $("#lb");
document.addEventListener("click", e => { const z = e.target.closest("[data-zoom]"); if(z){ lb.querySelector("img").src = z.dataset.zoom; lb.classList.add("on"); } });
lb.onclick = () => lb.classList.remove("on");
document.addEventListener("keydown", e => { if(e.key === "Escape") lb.classList.remove("on"); });

/* Inscription « Reste informé » */
const nf = $("#news");
if(nf) nf.addEventListener("submit", async e => {
  e.preventDefault();
  const m = $("#newsMsg"), f = nf.elements, email = f.email.value.trim();
  const say = (t, ok) => { m.style.color = ok ? "var(--ink)" : "var(--err)"; m.textContent = t; };
  if(f._gotcha && f._gotcha.value) return;                         // piège à robots
  if(!/^\S+@\S+\.\S+$/.test(email)) return say("Indiquez une adresse e-mail valide.");
  if(!f.ok.checked) return say("Cochez la case pour accepter de recevoir nos e-mails.");
  if(SHOP.newsletterEndpoint){
    try{
      const r = await fetch(SHOP.newsletterEndpoint, {method:"POST", headers:{"Content-Type":"application/json", Accept:"application/json"}, body:JSON.stringify({email, _subject:"Inscription aux infos CESI Lille"})});
      if(!r.ok) throw new Error(r.status);
    }catch(err){ return say("L'envoi a échoué. Réessayez, ou écrivez-nous directement."); }
  } else {
    location.href = `mailto:${SHOP.contactEmail}?subject=${encodeURIComponent("Inscription aux infos CESI Lille")}&body=${encodeURIComponent("Merci de m'ajouter à la liste : " + email)}`;
  }
  say("Merci ! On te prévient par e-mail.", true); nf.reset();
});

/* Le logo passe en pleine intensité quand le haut de l'accueil ou « La marque » est visible */
const vis = new Set();
if("IntersectionObserver" in window && $$("[data-logo]").length){
  const io = new IntersectionObserver(en => { en.forEach(e => e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)); document.body.classList.toggle("logo-on", vis.size > 0); }, {threshold:.3});
  $$("[data-logo]").forEach(el => io.observe(el));
}
})();
