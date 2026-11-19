/* BDE CESI Lille — page Contact : formulaire, copie de l'adresse, animations */
(function(){
"use strict";
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const anim = !!(window.gsap && window.ScrollTrigger) && !reduce;
const EMAIL = (typeof SHOP !== "undefined" && SHOP.contactEmail) || "bde-lille@viacesi.fr";
const ENDPOINT = (() => {
  const raw = typeof SHOP !== "undefined" ? SHOP.contactEndpoint : "";
  try{ const u = new URL(raw); return u.protocol === "https:" && u.hostname === "formspree.io" ? u.href : ""; }catch(e){ return ""; }
})();

$$("[data-mail]").forEach(a => { a.href = "mailto:" + EMAIL; if(a.hasAttribute("data-mail-text")) a.textContent = EMAIL; });
if(ENDPOINT){ const p = $(".c-form .intro p"); if(p) p.textContent = "Remplis le formulaire : ton message arrive directement au BDE, on te répond par e-mail."; }

/* ---------- Copier l'adresse e-mail ---------- */
const cp = $("#copyMail");
if(cp){
  if(!navigator.clipboard) cp.hidden = true;
  cp.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(EMAIL);
      cp.classList.add("done");
      if(anim) gsap.fromTo(cp, {scale:.92}, {scale:1, duration:.6, ease:"elastic.out(1,.5)"});
      setTimeout(() => cp.classList.remove("done"), 2200);
    }catch(e){ location.href = "mailto:" + EMAIL; }
  });
}

/* ---------- Formulaire ---------- */
const f = $("#cf");
if(f){
  const st = $("#f-status"), btn = $("#f-send");
  const say = (t, cls = "") => { st.textContent = t; st.className = "status " + cls; };
  const setErr = (el, msg) => {
    const box = el.closest(".field"); if(!box) return;
    box.classList.toggle("err", !!msg);
    const m = $(".msg", box); if(m) m.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  };
  const checks = {
    name: v => v.trim().length >= 2 ? "" : "Indique ton nom.",
    email: v => /^\S+@\S+\.\S+$/.test(v.trim()) ? "" : "Indique une adresse e-mail valide.",
    message: v => v.trim().length >= 10 ? "" : "Ton message est un peu court."
  };
  Object.keys(checks).forEach(k => {
    const el = f.elements[k];
    el.addEventListener("blur", () => { if(el.value) setErr(el, checks[k](el.value)); });
    el.addEventListener("input", () => { if(el.closest(".field").classList.contains("err")) setErr(el, checks[k](el.value)); });
  });

  f.addEventListener("submit", async e => {
    e.preventDefault();
    if(f.elements._gotcha.value) return;                       // piège à robots
    let first = null;
    Object.keys(checks).forEach(k => { const el = f.elements[k], m = checks[k](el.value); setErr(el, m); if(m && !first) first = el; });
    if(first){
      first.focus();
      if(anim) gsap.fromTo(first.closest(".field"), {x:-8}, {x:0, duration:.5, ease:"elastic.out(1,.3)"});
      return say("Vérifie les champs en rouge.", "bad");
    }
    if(!f.elements.ok.checked){
      if(anim) gsap.fromTo(".agree", {x:-8}, {x:0, duration:.5, ease:"elastic.out(1,.3)"});
      return say("Coche la case pour accepter que l'on te réponde.", "bad");
    }
    const d = {name:f.elements.name.value.trim(), email:f.elements.email.value.trim(), topic:f.elements.topic.value, message:f.elements.message.value.trim()};

    if(ENDPOINT){
      btn.disabled = true; say("Envoi en cours…");
      try{
        const r = await fetch(ENDPOINT, {method:"POST", headers:{"Content-Type":"application/json", Accept:"application/json"},
          body:JSON.stringify({...d, _subject:"[Site BDE] " + d.topic, _replyto:d.email})});
        if(!r.ok) throw new Error(r.status);
        f.reset(); say("Merci ! Ton message est bien parti, on te répond par e-mail.", "ok");
        if(anim) gsap.fromTo(st, {opacity:0, y:10}, {opacity:1, y:0, duration:.6});
      }catch(err){ say("L'envoi a échoué. Réessaie, ou écris directement à " + EMAIL + ".", "bad"); }
      btn.disabled = false;
    }else{
      const body = `${d.message}\n\n— ${d.name}\n${d.email}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("[Site BDE] " + d.topic)}&body=${encodeURIComponent(body)}`;
      say("Ta messagerie s'ouvre avec le message prêt à envoyer. Rien ne s'ouvre ? Écris à " + EMAIL + ".", "ok");
    }
  });
}

/* =====================================================================
   ANIMATIONS
   ===================================================================== */
if(!anim){ root.classList.remove("js-anim"); return; }
gsap.registerPlugin(ScrollTrigger);
gsap.config({nullTargetWarn:false});
gsap.ticker.lagSmoothing(0);

/* Entrée */
gsap.timeline({defaults:{ease:"expo.out"}})
  .fromTo("#gnav", {opacity:0, y:-14}, {opacity:1, y:0, duration:1, stagger:.08}, 0)
  .fromTo(".c-hero .kicker", {opacity:0, y:18}, {opacity:1, y:0, duration:1.1}, .2)
  .fromTo(".c-hero h1 .ln > span", {y:0, yPercent:110}, {y:0, yPercent:0, duration:1.4}, .3)
  .fromTo(".c-hero .lead", {opacity:0, y:22}, {opacity:1, y:0, duration:1.1}, .7)
  .fromTo("#cMark", {opacity:0, scale:.6, rotationY:-90, filter:"blur(12px)"}, {opacity:1, scale:1, rotationY:0, filter:"blur(0px)", duration:2}, .6)
  .add(() => { $("#cMark").style.filter = ""; });


/* Apparitions */
gsap.set("[data-rise]", {opacity:0, y:50});
ScrollTrigger.batch("[data-rise]", {start:"top 90%", once:true,
  onEnter:els => gsap.to(els, {opacity:1, y:0, duration:1.2, stagger:.1, ease:"power3.out", overwrite:"auto"})});

/* Champs du formulaire qui arrivent un par un */
gsap.from("#cf > *", {opacity:0, y:24, duration:.9, stagger:.06, ease:"power3.out",
  scrollTrigger:{trigger:"#cf", start:"top 80%", once:true}});

window.addEventListener("load", () => ScrollTrigger.refresh());
})();
