/* Mise à jour du site : chaque page connaît sa version (le « ?v= » de ce script). Toutes les minutes, et quand on revient
   sur l'onglet, elle lit version.txt ; si le site a été republié avec une autre version, la page se recharge d'elle-même
   (tout de suite si l'onglet est caché ou dès qu'on y revient ; pas pendant qu'on écrit dans un champ). */
(function(){
  "use strict";
  var me = document.currentScript && /[?&]v=(\d+)/.exec(document.currentScript.src);
  if(!me || location.protocol === "file:" || !window.fetch) return;
  var mine = me[1], pending = false;
  var reload = function(){
    var el = document.activeElement, typing = el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    if(document.hidden || !typing) location.reload(); else setTimeout(reload, 5000);
  };
  var check = function(){
    if(pending) return;
    fetch("/version.txt?t=" + Date.now(), {cache:"no-store", credentials:"same-origin"})
      .then(function(r){ return r.ok ? r.text() : ""; })
      .then(function(t){ t = t.trim(); if(!/^\d+$/.test(t) || t === mine) return;
        /* une seule tentative par nouvelle version : si le navigateur ressert l'ancienne page, on ne boucle pas */
        var done = ""; try{ done = sessionStorage.getItem("bde-maj") || ""; sessionStorage.setItem("bde-maj", t); }catch(e){ return; }
        if(done === t) return;
        pending = true; reload(); })
      .catch(function(){});
  };
  setInterval(check, 60000);
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) check(); });
  setTimeout(check, 4000);
})();

/* Navigation globale : menu mobile (partagé par toutes les pages) */
(function(){
  "use strict";
  var gnav = document.getElementById("gnav");
  if(!gnav) return;
  var burger = gnav.querySelector(".burger");
  /* Le logo : sur téléphone/tablette il ouvre et ferme le menu (le bouton ☰ est masqué) en faisant un tour sur lui-même ;
     sur ordinateur c'est un simple lien vers l'accueil. */
  var brand = gnav.querySelector(".wrap > .brand"), small = matchMedia("(max-width: 834px)");
  /* le tour est fait aussi par le logo de la copie noire de la barre (visible sur les sections noires) */
  /* ouverture : tour de droite à gauche ; fermeture : tour de gauche à droite */
  var spin = function(back){ gnav.querySelectorAll(".brand").forEach(function(b){ b.classList.remove("spin", "spin-back"); void b.offsetWidth; b.classList.add(back ? "spin-back" : "spin"); }); };
  /* le menu sort du côté de l'étoile (en haut à gauche) et glisse vers la droite, poussé par ses pieds qui tournent ;
     à la fermeture il repart par le même chemin (classe .closing le temps de l'animation, voir site.css) */
  var closeTimer = 0, calm = matchMedia("(prefers-reduced-motion: reduce)");
  var isOpen = function(){ return gnav.classList.contains("open") && !gnav.classList.contains("closing"); };
  var setMenu = function(open){
    clearTimeout(closeTimer);
    if(open){ gnav.classList.remove("closing"); gnav.classList.add("open"); }
    else if(gnav.classList.contains("open") && !calm.matches){
      gnav.classList.add("closing");
      closeTimer = setTimeout(function(){ gnav.classList.remove("open", "closing"); }, 480);
    }else gnav.classList.remove("open", "closing");
    [burger, small.matches ? brand : null].forEach(function(b){ if(!b) return; b.setAttribute("aria-expanded", open); b.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu"); });
  };
  var mode = function(){                        /* rôle du logo selon la taille d'écran */
    if(!brand) return;
    if(small.matches){ brand.setAttribute("role", "button"); brand.setAttribute("aria-controls", "sheet"); brand.setAttribute("aria-expanded", isOpen()); brand.setAttribute("aria-label", "Ouvrir le menu"); }
    else { setMenu(false); ["role", "aria-controls", "aria-expanded"].forEach(function(k){ brand.removeAttribute(k); }); brand.setAttribute("aria-label", "BDE CESI Lille – accueil"); }
  };
  mode(); if(small.addEventListener) small.addEventListener("change", mode);
  var toggle = function(e){ if(e) e.preventDefault(); setMenu(!isOpen()); };
  if(burger) burger.addEventListener("click", toggle);
  if(brand){
    brand.addEventListener("click", function(e){
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;     /* ouverture dans un nouvel onglet : on laisse faire */
      if(small.matches){ spin(!isOpen()); toggle(e); }   /* ordinateur : simple lien vers l'accueil, sans rotation */
    });
    brand.addEventListener("keydown", function(e){ if(e.key === " " && small.matches){ spin(!isOpen()); toggle(e); } });
  }
  /* clic à côté du menu (sur ordinateur il ne couvre pas tout l'écran) : on le ferme */
  document.addEventListener("click", function(e){ if(isOpen() && !gnav.contains(e.target) && !e.target.closest("#sheet")) setMenu(false); });
  document.querySelectorAll("#sheet a").forEach(function(a){ a.addEventListener("click", function(){ setMenu(false); }); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") setMenu(false); });

  /* Barre du haut sur les sections noires : une copie noire de la barre est découpée exactement à la frontière,
     au pixel près. Tant que la barre est sur du blanc elle reste blanche ; dès que le noir la touche, il la gagne
     depuis ce bord (et la quitte de la même façon). */
  var darks = document.querySelectorAll(".socle, [data-dark]");
  if(!darks.length) return;
  var layer = document.createElement("div");
  layer.className = "gnav-dark"; layer.setAttribute("aria-hidden", "true"); layer.inert = true;
  var copy = gnav.querySelector(".wrap").cloneNode(true);
  copy.querySelectorAll("[id]").forEach(function(el){ el.removeAttribute("id"); });
  layer.appendChild(copy); gnav.appendChild(layer);
  /* la copie noire ne reçoit pas la souris : on y reporte le survol des vrais liens */
  var real = gnav.querySelector(".wrap").querySelectorAll("ul a"), mirror = copy.querySelectorAll("ul a");   /* la 1re .wrap est l'originale */
  real.forEach(function(a, i){
    var m = mirror[i]; if(!m) return;
    var on = function(){ m.classList.add("is-hover"); }, off = function(){ m.classList.remove("is-hover"); };
    a.addEventListener("pointerenter", on); a.addEventListener("pointerleave", off);
    a.addEventListener("focus", on); a.addEventListener("blur", off);
  });
  var ticking = false, touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if(touch){ layer.style.transition = "opacity .2s"; layer.style.opacity = "0"; }
  var update = function(){
    ticking = false;
    var H = gnav.offsetHeight, top = H, bot = 0;
    darks.forEach(function(el){
      var r = el.getBoundingClientRect(), t = Math.max(0, r.top), b = Math.min(H, r.bottom);
      if(b > t){ top = Math.min(top, t); bot = Math.max(bot, b); }
    });
    if(touch){   /* téléphone : Safari fait défiler la page avant que la découpe suive, ce qui laissait une bande de la
                    mauvaise couleur à la frontière ; la barre bascule donc en entier, en fondu, quand le noir en couvre la moitié */
      var on = bot - top > H / 2; layer.style.visibility = "visible"; layer.style.clipPath = "none"; layer.style.opacity = on ? "1" : "0";
      return;
    }
    if(bot > top){ layer.style.visibility = "visible"; layer.style.clipPath = "inset(" + top + "px 0 " + (H - bot) + "px 0)"; }
    else layer.style.visibility = "hidden";
  };
  var req = function(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, {passive:true}); addEventListener("resize", req);
  update();
})();
