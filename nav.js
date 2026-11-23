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

/* Date limite des précommandes (products.js > SHOP.preorderEnd, heure de Paris).
   Avant : « Précommandes ouvertes jusqu'au jeudi 26 novembre à 18 h » sur les éléments [data-deadline].
   Après : classe .preorder-closed sur <html> (la page Boutique remplace alors la boutique intégrée par un message). */
(function(){
  "use strict";
  if(typeof SHOP === "undefined" || !SHOP.preorderEnd) return;
  var raw = String(SHOP.preorderEnd).trim();
  var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?$/.exec(raw);
  if(!m) return;
  var hasTime = m[4] !== undefined;
  var y = +m[1], mo = +m[2] - 1, d = +m[3], h = hasTime ? +m[4] : 23, mi = hasTime ? +m[5] : 59;
  /* heure de Paris -> instant UTC, quel que soit le fuseau du visiteur (gère l'heure d'été) */
  var guess = Date.UTC(y, mo, d, h, mi);
  var offset = function(t){
    try{
      var p = {}; new Intl.DateTimeFormat("en-GB", {timeZone:"Europe/Paris", hourCycle:"h23", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit"})
        .formatToParts(new Date(t)).forEach(function(x){ p[x.type] = x.value; });
      return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - t;
    }catch(e){ return 3600000; }
  };
  var end = guess - offset(guess - offset(guess));
  var closed = Date.now() >= end;
  var label;
  try{ label = new Date(end).toLocaleDateString("fr-FR", {weekday:"long", day:"numeric", month:"long", timeZone:"Europe/Paris"}); }
  catch(e){ label = d + "/" + (mo + 1); }
  if(hasTime) label += " à " + h + " h" + (mi ? " " + (mi < 10 ? "0" : "") + mi : "");
  document.querySelectorAll("[data-deadline]").forEach(function(el){
    el.textContent = closed ? "Les précommandes sont terminées." : "Précommandes ouvertes jusqu'au " + label + ".";
    el.hidden = false;
  });
  if(closed) document.documentElement.classList.add("preorder-closed");
  /* page restée ouverte : on bascule à l'heure dite */
  else if(end - Date.now() < 2147483647) setTimeout(function(){
    document.documentElement.classList.add("preorder-closed");
    document.querySelectorAll("[data-deadline]").forEach(function(el){ el.textContent = "Les précommandes sont terminées."; });
  }, end - Date.now());
})();
