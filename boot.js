/* Chargé dans <head> : prépare les états de départ des animations (sauf si l'utilisateur demande moins d'animations) */
(function(){
  /* Anti « clickjacking » : GitHub Pages ne permet pas d'envoyer l'en-tête qui interdit l'intégration du site dans une
     autre page ; si le site est affiché dans le cadre d'un autre site, on le masque et on ouvre la vraie page à la place. */
  if(window.top !== window.self){
    var same = false; try{ same = window.top.location.origin === window.location.origin; }catch(e){}
    if(!same){ document.documentElement.style.display = "none";
      try{ window.top.location = window.location.href; }catch(e){} return; }
  }
  /* Page d'attente : jusqu'à l'ouverture (lundi 23 novembre 2026, 8 h 30, heure de Paris), le site renvoie vers
     attente.html, sauf pour ceux qui ont saisi le code d'accès (jeton gardé dans ce navigateur, voir attente.js).
     Les infos légales restent accessibles. Après l'heure d'ouverture, plus rien n'est bloqué. */
  var OUVERTURE = 1795419000000, JETON = "0596365f95335e86bf7c7678507404a6215dee8b839923a146de952866565c68";
  var page = location.pathname.split("/").pop() || "index.html";
  if(Date.now() < OUVERTURE && page !== "attente.html" && page !== "infos-legales.html"){
    var ok = false; try{ ok = localStorage.getItem("bde-acces") === JETON; }catch(e){}
    if(!ok){ document.documentElement.style.visibility = "hidden";
      location.replace("attente.html?suite=" + encodeURIComponent(page + location.hash)); return; }
  }
  /* dernier moyen utilisé (clavier ou doigt/souris) : les fenêtres qui s'ouvrent ne mettent en évidence leur bouton
     « fermer » que pour le clavier (sinon un anneau bleu apparaît après chaque toucher) */
  window.__kbd = false;
  addEventListener("keydown", function(e){ if(e.key === "Tab" || e.key === "Enter" || e.key === " ") window.__kbd = true; }, true);
  addEventListener("pointerdown", function(){ window.__kbd = false; }, true);
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var d = document.documentElement;
  d.classList.add("js-anim");
  /* Accueil : écran de chargement noir, une seule fois par session (home.js le retire) ; filet de sécurité à 9 s */
  var home = /(^|\/)(index\.html)?$/.test(location.pathname);
  try{ if(home && sessionStorage.getItem("bde-cesi-lille-loader") !== "1"){ d.classList.add("ld-on");
    setTimeout(function(){ d.classList.remove("ld-on"); }, 9000); } }catch(e){}
  /* Collection : tant que le booster n'est pas ouvert (une fois par session), la suite de la page reste cachée.
     Filet de sécurité : si la scène 3D ne démarre pas, on réaffiche tout. */
  try{ if(page === "collection.html" && sessionStorage.getItem("bde-cesi-lille-booster") !== "1"){ d.classList.add("pack-closed");
    setTimeout(function(){ var s = document.getElementById("rackStage"); if(!s || !s.classList.contains("is-3d")) d.classList.remove("pack-closed"); }, 6000); } }catch(e){}
  /* Filet de sécurité : si GSAP ne se charge pas, on affiche tout */
  setTimeout(function(){ if(!window.gsap) d.classList.remove("js-anim"); }, 2500);
})();
