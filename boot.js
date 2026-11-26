/* Chargé dans <head> : prépare les états de départ des animations (sauf si l'utilisateur demande moins d'animations) */
(function(){
  /* Anti « clickjacking » : GitHub Pages ne permet pas d'envoyer l'en-tête qui interdit l'intégration du site dans une
     autre page ; si le site est affiché dans le cadre d'un autre site, on le masque et on ouvre la vraie page à la place. */
  if(window.top !== window.self){
    var same = false; try{ same = window.top.location.origin === window.location.origin; }catch(e){}
    if(!same){ document.documentElement.style.display = "none";
      try{ window.top.location = window.location.href; }catch(e){} return; }
  }
  var page = location.pathname.split("/").pop() || "index.html";
  /* l'accueil s'affiche à l'adresse nue du site (bde-cesi-lille.fr/), même si on arrive par un ancien lien « index.html » */
  if(page === "index.html" && /\/index\.html$/.test(location.pathname)){
    try{ history.replaceState(history.state, "", location.pathname.replace(/index\.html$/, "") + location.search + location.hash); }catch(e){}
  }
  /* l'ancienne page d'attente n'existe plus (GitHub Pages sert alors 404.html) : on file à l'accueil */
  if(page === "attente.html"){ document.documentElement.style.visibility = "hidden"; location.replace("./"); return; }
  try{ sessionStorage.removeItem("bde-ouvert"); sessionStorage.removeItem("bde-acces"); localStorage.removeItem("bde-acces"); }catch(e){}
  /* dernier moyen utilisé (clavier ou doigt/souris) : les fenêtres qui s'ouvrent ne mettent en évidence leur bouton
     « fermer » que pour le clavier (sinon un anneau bleu apparaît après chaque toucher) */
  window.__kbd = false;
  addEventListener("keydown", function(e){ if(e.key === "Tab" || e.key === "Enter" || e.key === " ") window.__kbd = true; }, true);
  addEventListener("pointerdown", function(){ window.__kbd = false; }, true);
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var d = document.documentElement;
  d.classList.add("js-anim");
  /* Écran de chargement noir, une seule fois par visite, sur la première page ouverte (home.js ou chargement.js le
     retirent une fois tout le site téléchargé) ; sans eux (erreur), il disparaît quand la page a fini de charger */
  var avecEcran = /^(index|collection|boutique|contact|infos-legales)\.html$/.test(page);
  try{ if(avecEcran && sessionStorage.getItem("bde-cesi-lille-loader") !== "1"){ d.classList.add("ld-on");
    addEventListener("load", function(){ if(!window.__ldCtl) d.classList.remove("ld-on"); }); } }catch(e){}
  /* Collection : tant que le booster n'est pas ouvert (une fois par session), la suite de la page reste cachée.
     Filet de sécurité : si la scène 3D ne démarre pas, on réaffiche tout. */
  try{ if(page === "collection.html" && location.hash !== "#voir" && sessionStorage.getItem("bde-cesi-lille-booster") !== "1"){ d.classList.add("pack-closed");
    setTimeout(function(){ var s = document.getElementById("rackStage"); if(!s || !s.classList.contains("is-3d")) d.classList.remove("pack-closed"); }, 6000); } }catch(e){}
  /* Filet de sécurité : si GSAP ne se charge pas, on affiche tout */
  setTimeout(function(){ if(!window.gsap) d.classList.remove("js-anim"); }, 2500);
})();
