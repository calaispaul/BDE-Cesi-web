// Lancé par .github/workflows/ouverture.yml : à l'heure d'ouverture (jeudi 26 novembre 2026, 20 h, Paris),
// retire la page d'attente du site. Ne fait rien avant l'heure, ni si c'est déjà fait. S'arrête sur une erreur
// (rien n'est alors publié) si un fichier a changé et ne correspond plus à ce qui est attendu.
import fs from "node:fs";

const OUVERTURE = Date.UTC(2026, 10, 26, 19, 0, 0);
const force = process.argv.includes("--force");
if (Date.now() < OUVERTURE && !force) { console.log("Pas encore l'heure d'ouverture : rien à faire."); process.exit(0); }
if (!fs.existsSync("attente.html")) { console.log("La page d'attente est déjà retirée : rien à faire."); process.exit(0); }

const lire = f => fs.readFileSync(f, "utf8");
const remplacer = (f, avant, apres) => {
  const s = lire(f);
  if (!s.includes(avant)) throw new Error(`${f} : texte introuvable :\n${avant.slice(0, 120)}`);
  fs.writeFileSync(f, s.replace(avant, apres));
};

// 1. boot.js sans le blocage d'avant l'ouverture (version préparée à côté de ce script)
fs.copyFileSync(".github/ouverture/boot.js", "boot.js");
fs.unlinkSync(".github/ouverture/boot.js");

// 2. fichiers de la page d'attente
for (const f of ["attente.html", "attente.js", "rappel.ics", "images/attente-pull.png"]) fs.rmSync(f, { force: true });

// 3. styles de la page d'attente
{
  const css = lire("site.css");
  const a = css.indexOf("/* =====================================================================\n   PAGE D'ATTENTE");
  const b = css.indexOf("/* ---------- Page Contact en diaporama");
  if (a < 0 || b < a) throw new Error("site.css : bloc « PAGE D'ATTENTE » introuvable");
  fs.writeFileSync("site.css", css.slice(0, a) + css.slice(b));
}

// 4. README
remplacer("README.md", ", 404.html, attente.html\n", ", 404.html\n");
remplacer("README.md", "anti-intégration, page d'attente (heure du serveur), états de départ (compacté)", "anti-intégration, adresse propre de l'accueil, états de départ des animations");
remplacer("README.md", "├── attente.js          page d'attente : compte à rebours, pull en pixels, accès équipe (compacté)\n", "");
remplacer("README.md", "    ├── banniere-boutique.webp               bannière de la page Boutique\n    └── attente-pull.png                     pull déjà pixellisé (80 × 80) de la page d'attente\n",
  "    └── banniere-boutique.webp               bannière de la page Boutique\n");
{
  const s = lire("README.md"), a = s.indexOf("## Page d'attente (");
  if (a < 0) throw new Error("README.md : partie « Page d'attente » introuvable");
  const b = s.indexOf("\n## ", a + 5);
  fs.writeFileSync("README.md", s.slice(0, a) + "## Page d'attente\n\nLa page d'attente a servi jusqu'à l'ouverture du jeudi 26 novembre 2026, 20 h ; elle a été retirée automatiquement\n(`.github/workflows/ouverture.yml`). Elle reste dans l'historique Git. Une ancienne adresse `attente.html` renvoie vers l'accueil.\n" + (b < 0 ? "" : s.slice(b)));
}

// 5. nouvelle version des fichiers dans toutes les pages (pour que les navigateurs ne gardent pas l'ancien boot.js)
const d = new Date(), p = n => String(n).padStart(2, "0");
const v = `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}`;
for (const f of fs.readdirSync(".").filter(f => f.endsWith(".html"))) {
  fs.writeFileSync(f, lire(f).replace(/\?v=\d{10}/g, "?v=" + v));
}
console.log("Page d'attente retirée, version des fichiers :", v);
