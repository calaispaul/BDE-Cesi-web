/* Navigation globale : menu mobile (partagé par toutes les pages) */
(function(){
  "use strict";
  var gnav = document.getElementById("gnav");
  if(!gnav) return;
  var burger = gnav.querySelector(".burger");
  var setMenu = function(open){
    gnav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };
  burger.addEventListener("click", function(){ setMenu(!gnav.classList.contains("open")); });
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
  var ticking = false;
  var update = function(){
    ticking = false;
    var H = gnav.offsetHeight, top = H, bot = 0;
    darks.forEach(function(el){
      var r = el.getBoundingClientRect(), t = Math.max(0, r.top), b = Math.min(H, r.bottom);
      if(b > t){ top = Math.min(top, t); bot = Math.max(bot, b); }
    });
    if(bot > top){ layer.style.visibility = "visible"; layer.style.clipPath = "inset(" + top + "px 0 " + (H - bot) + "px 0)"; }
    else layer.style.visibility = "hidden";
  };
  var req = function(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, {passive:true}); addEventListener("resize", req);
  update();
})();
