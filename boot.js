/* Chargé dans <head> : prépare les états de départ des animations (sauf si l'utilisateur demande moins d'animations) */
(function(){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var d = document.documentElement;
  d.classList.add("js-anim");
  /* Accueil : écran de chargement noir, une seule fois par session (home.js le retire) ; filet de sécurité à 9 s */
  var home = /(^|\/)(index\.html)?$/.test(location.pathname);
  try{ if(home && sessionStorage.getItem("bde-cesi-lille-loader") !== "1"){ d.classList.add("ld-on");
    setTimeout(function(){ d.classList.remove("ld-on"); }, 9000); } }catch(e){}
  /* Collection : tant que le booster n'est pas ouvert (une fois par session), la suite de la page reste cachée.
     Filet de sécurité : si la scène 3D ne démarre pas, on réaffiche tout. */
  try{ if(sessionStorage.getItem("bde-cesi-lille-booster") !== "1"){ d.classList.add("pack-closed");
    setTimeout(function(){ var s = document.getElementById("rackStage"); if(!s || !s.classList.contains("is-3d")) d.classList.remove("pack-closed"); }, 6000); } }catch(e){}
  /* Filet de sécurité : si GSAP ne se charge pas, on affiche tout */
  setTimeout(function(){ if(!window.gsap) d.classList.remove("js-anim"); }, 2500);
})();
