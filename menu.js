/* Menu burger (panneau à gauche) */
(function(){
"use strict";
const btn = document.querySelector(".burger"), menu = document.getElementById("menu"), scrim = document.querySelector(".scrim");
if(!btn || !menu || !scrim) return;
const page = (location.pathname.split("/").pop() || "index.html");
menu.querySelectorAll("a").forEach(a => {
  const h = a.getAttribute("href") || "";
  if(h.indexOf("#") < 0 && h.indexOf("mailto:") !== 0 && h.split("/").pop() === page) a.setAttribute("aria-current", "page");
});
const links = () => [...menu.querySelectorAll("a, button")].filter(el => el.offsetParent !== null);   /* éléments visibles du menu */
const tog = menu.querySelector(".dtoggle"), sub = menu.querySelector(".dsub");
function group(open){ if(!tog || !sub) return; tog.setAttribute("aria-expanded", open); sub.hidden = !open; }
if(tog && sub){
  tog.addEventListener("click", () => group(tog.getAttribute("aria-expanded") !== "true"));
  if(sub.querySelector('[aria-current="page"]')) group(true);          /* ouvert si on est déjà dans la boutique */
}
function set(open){
  btn.setAttribute("aria-expanded", open);
  btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  menu.classList.toggle("on", open);
  menu.setAttribute("aria-hidden", !open);
  document.body.classList.toggle("menu-open", open);
  if(open){ scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("on")); links()[0].focus({preventScroll:true}); }
  else { scrim.classList.remove("on"); setTimeout(() => { if(!menu.classList.contains("on")) scrim.hidden = true; }, 350); }
}
btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
scrim.addEventListener("click", () => { set(false); btn.focus(); });
menu.addEventListener("click", e => { if(e.target.closest("a")) set(false); });
document.addEventListener("keydown", e => {
  if(!menu.classList.contains("on")) return;
  if(e.key === "Escape"){ set(false); btn.focus(); }
  if(e.key === "Tab"){                                   /* le focus reste dans le menu tant qu'il est ouvert */
    const f = [btn, ...links()], i = f.indexOf(document.activeElement);
    if(e.shiftKey && i <= 0){ e.preventDefault(); f[f.length - 1].focus(); }
    else if(!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus(); }
  }
});
})();
