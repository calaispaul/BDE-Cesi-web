# Site du BDE CESI Lille — collection 2026-2027

Site vitrine du Bureau des étudiants CESI Lille : présentation du BDE, de son logo et de la collection
(pull et T-shirt), avec la boutique **SumUp** du BDE pour commander et payer.

Le site est **100 % statique** (HTML, CSS, JavaScript) : pas de serveur, pas de base de données, pas de compte
utilisateur. Il s'héberge tel quel sur **GitHub Pages**, avec un nom de domaine **IONOS**.

---

## Sommaire

1. [Les pages](#1-les-pages)
2. [Organisation des fichiers](#2-organisation-des-fichiers)
3. [Modifier le contenu](#3-modifier-le-contenu)
4. [Voir le site sur son ordinateur](#4-voir-le-site-sur-son-ordinateur)
5. [Mettre en ligne sur GitHub Pages](#5-mettre-en-ligne-sur-github-pages)
6. [Brancher le nom de domaine IONOS](#6-brancher-le-nom-de-domaine-ionos)
7. [Mettre à jour le site](#7-mettre-à-jour-le-site)
8. [Sécurité et vie privée](#8-sécurité-et-vie-privée)
9. [Fonctionnement des animations](#9-fonctionnement-des-animations)
10. [Avant d'annoncer le site](#10-avant-dannoncer-le-site)
11. [Crédits](#11-crédits)

---

## 1. Les pages

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Écran de chargement, médaillon 3D du logo, explication du logo et plan de la Citadelle, photo du BDE, les quatre membres de l'exécutif, lien vers la collection |
| Collection | `collection.html` | Booster à ouvrir, tringle 3D des 8 pièces (fiche produit au clic avec zoom), « Face et dos » (brodé / imprimé), la matière et les chiffres, l'atelier (collaboration CESI Lille × Maison Vitali), lien vers la boutique |
| Boutique | `boutique.html` | Sur ordinateur : la boutique SumUp intégrée. Sur téléphone : trois cartes (Pull, T-shirt, Pack) qui ouvrent directement la page SumUp de l'article |
| Contact | `contact.html` | E-mail, adresse, réseaux, formulaire (ouvre la messagerie du visiteur), questions fréquentes |
| Infos légales | `infos-legales.html` | Mentions légales, conditions de vente, confidentialité |
| Page introuvable | `404.html` | Affichée automatiquement par GitHub Pages pour toute adresse qui n'existe pas |

Toutes les pages partagent le même en-tête, le même pied de page et la même feuille de style.
Sur téléphone, le **logo en haut à gauche ouvre le menu** (il tourne sur lui-même et pousse le menu) ;
sur ordinateur, le logo ramène à l'accueil et le menu est affiché dans la barre.

---

## 2. Organisation des fichiers

```
.
├── index.html, collection.html, boutique.html, contact.html, infos-legales.html, 404.html
├── site.css            feuille de style unique (couleurs, mise en page, animations CSS)
├── products.js         catalogue : produits, prix, coloris, tailles, e-mail de contact  ← à modifier
├── boot.js             chargé en premier : protection anti-intégration, états de départ des animations
├── nav.js              barre du haut et menu (logo qui ouvre le menu sur téléphone)
├── home.js             animations de l'accueil et de la collection (GSAP + ScrollTrigger)
├── pendant.js          médaillon 3D du logo sur l'accueil (Three.js)
├── logo-shape.js       contours vectoriels du logo (relief 3D du médaillon et du booster)
├── collection3d.js     booster, tringle 3D, fiche produit et zoom (Three.js)
├── contact.js          formulaire et bouton « Copier l'adresse » de la page Contact
├── favicon.png         icône de l'onglet (logo noir sur fond blanc)
├── robots.txt          autorise l'indexation par les moteurs de recherche
├── .nojekyll           indique à GitHub Pages de publier les fichiers tels quels
├── fonts/              police Pirata One (titres gothiques)
├── vendor/             bibliothèques : GSAP, ScrollTrigger, Three.js (hébergées avec le site)
└── images/
    ├── logo-noir.png, logo-noir-grand.png   logo noir (barre du haut, pied de page, plan)
    ├── partage.jpg                          image affichée quand on partage le lien (logo noir sur fond blanc, 1200 × 630)
    ├── sweat-*.jpg, tshirt-black-*.jpg      photos face / dos de « Face et dos »
    ├── pieces/                              visuels de la tringle : <pull|tee>-<coloris>-<face|dos|side>.png
    ├── equipe/                              photos du BDE et des membres
    ├── collab/                              logos CESI Lille et Maison Vitali (partie « L'atelier »)
    └── design/tshirt-design.png             fichier source du design du T-shirt (devant et dos)
```

Il n'y a **aucune étape de compilation** : ce qui est dans le dépôt est exactement ce qui est publié.

---

## 3. Modifier le contenu

### Produits, prix, coloris (fiches de la tringle)
Tout est dans **`products.js`** :
- `price` : prix affiché dans la fiche produit ;
- `desc`, `material`, `guideTable` (guide des tailles en cm) ;
- `colors` : un coloris = `id` (sert à trouver les visuels `images/pieces/…`), `name`, `sumup` (libellé exact sur SumUp), `hex`.

Les prix et coloris doivent rester **identiques à la boutique SumUp**, c'est elle qui fait foi pour la commande.

**Ajouter un coloris** : ajouter une ligne dans `colors` et déposer les trois visuels
`images/pieces/<pull|tee>-<id>-face.png`, `-dos.png` et `-side.png` (640 × 640 px, fond transparent).

### Boutique sur téléphone
Les trois cartes (Pull, T-shirt, Pack) et leurs liens SumUp sont écrits directement dans `boutique.html`
(bloc `<section class="store-m">`). Les adresses actuelles :
- Pull : `https://bde-cesi-lille.sumupstore.com/product/pull`
- T-shirt : `https://bde-cesi-lille.sumupstore.com/product/t-shirt`
- Pack : `https://bde-cesi-lille.sumupstore.com/product/pack-t-shirt-pull-1`

### Textes
Les textes sont dans les fichiers `.html`, en clair. Les membres du BDE sont dans `index.html`
(blocs `<article class="member">`), avec leurs photos dans `images/equipe/`.

### Adresse e-mail de contact
`contactEmail` dans `products.js` ; elle est aussi écrite dans les pages (liens `mailto:`) et dans
`infos-legales.html`. Penser à la changer partout.

### Formulaire de contact
Par défaut, le formulaire **ouvre la messagerie** du visiteur avec le message prérempli : rien n'est envoyé
ni stocké par le site. Pour recevoir les messages directement, créer un formulaire gratuit sur
[formspree.io](https://formspree.io) et coller son adresse (`https://formspree.io/f/...`) dans
`contactEndpoint` de `products.js`. Seules les adresses `https://formspree.io` sont acceptées.

### Mentions légales
Dans `infos-legales.html`. Si l'hébergeur, le nom de domaine ou le responsable de la publication change,
les mettre à jour ici.

---

## 4. Voir le site sur son ordinateur

Les animations 3D chargent des fichiers : il faut passer par un petit serveur local (ouvrir `index.html`
directement en double-cliquant ne suffit pas pour tout).

Avec Python (déjà installé sur la plupart des ordinateurs), dans le dossier du site :

```bash
python -m http.server 8080
```

puis ouvrir **http://localhost:8080** dans le navigateur. `Ctrl + C` pour arrêter.

> L'écran de chargement de l'accueil et le booster de la collection ne s'affichent **qu'une fois par session**.
> Pour les revoir, ouvrir un nouvel onglet ou une fenêtre de navigation privée.

---

## 5. Mettre en ligne sur GitHub Pages

1. Le contenu du dossier doit être **à la racine du dépôt** (`index.html` à la racine, pas dans un sous-dossier).
2. Sur GitHub : **Settings → Pages**.
3. **Source** : *Deploy from a branch*, branche **`main`**, dossier **`/ (root)`**, puis **Save**.
4. Après une à deux minutes, le site répond sur `https://<compte>.github.io/<dépôt>/`.

Le dépôt doit être **public** avec l'offre gratuite de GitHub. Il ne contient aucun mot de passe ni clé secrète.

---

## 6. Brancher le nom de domaine IONOS

Exemple avec le domaine `votre-domaine.fr` (remplacer par le vrai). On recommande d'utiliser
**`www.votre-domaine.fr`** comme adresse principale ; le domaine sans `www` redirige dessus.

### Étape 1 — côté GitHub (à faire en premier)
**Settings → Pages → Custom domain** : saisir `www.votre-domaine.fr`, **Save**.
GitHub ajoute alors un fichier `CNAME` dans le dépôt : **ne pas le supprimer**.

### Étape 2 — côté IONOS
Dans l'espace client IONOS : **Domaines & SSL → votre domaine → DNS**.

| Type | Nom d'hôte | Valeur |
|---|---|---|
| CNAME | `www` | `<compte>.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

- **Supprimer** les enregistrements `A` / `AAAA` existants pour `@` et `www` qui pointent ailleurs
  (par exemple la page de parking IONOS) : ils empêchent GitHub d'obtenir le certificat HTTPS.
- Si IONOS propose une « redirection » ou un « site par défaut » sur le domaine, la désactiver.

### Étape 3 — HTTPS
De retour dans **Settings → Pages** : attendre que la vérification DNS passe au vert, puis cocher
**Enforce HTTPS**. La propagation DNS et le certificat peuvent prendre de quelques minutes à 24 h.

---

## 7. Mettre à jour le site

Toute modification poussée sur la branche `main` est publiée automatiquement en une à deux minutes :

```bash
git add -A
git commit -m "Description de la modification"
git push
```

On peut aussi modifier un fichier directement sur github.com (icône crayon), puis **Commit changes**.

Si un changement n'apparaît pas : recharger la page avec `Ctrl + F5` (le navigateur garde des fichiers en cache).

**Forcer les visiteurs à recharger le CSS et le JavaScript** : dans les pages, les liens vers `site.css` et
les fichiers `.js` portent un numéro de version (`site.css?v=2026111927`). Après une modification de ces
fichiers, remplacer ce numéro partout par la date du jour (rechercher/remplacer `?v=2026111927` dans les
`.html`) : les navigateurs téléchargent alors la nouvelle version au lieu de garder l'ancienne en cache.

> **Page 404** : ses liens commencent par `/` pour fonctionner quelle que soit l'adresse introuvable. Elle
> s'affiche donc correctement à la racine d'un domaine (après le branchement du domaine IONOS), mais sans
> mise en forme sur l'adresse provisoire `calaispaul.github.io/BDE-Cesi-web/`.

---

## 8. Sécurité et vie privée

- **Aucune donnée sensible** : le site ne gère ni compte, ni mot de passe, ni paiement. La commande et le
  paiement se font chez **SumUp**, qui traite seul les données bancaires.
- **Politique de sécurité du contenu (CSP)** dans chaque page : seuls les scripts du site lui-même
  peuvent s'exécuter (aucun script externe, aucun script en ligne), les formulaires ne peuvent envoyer
  que vers le site ou Formspree, et seule la page Boutique peut intégrer SumUp.
- **Anti-intégration (clickjacking)** : GitHub Pages ne permet pas d'envoyer d'en-têtes HTTP de sécurité.
  `boot.js` empêche donc d'afficher le site dans le cadre d'un autre site (il le masque et ouvre la vraie page).
- **Liens externes** ouverts dans un nouvel onglet avec `rel="noopener noreferrer"`.
- **Bibliothèques hébergées avec le site** (`vendor/`) : aucune dépendance à un CDN externe.
- **Formulaire** : ce que tape le visiteur n'est jamais injecté dans la page ; un champ piège bloque les robots.
- **Vie privée** : pas de cookie publicitaire ni de mesure d'audience. Le site retient seulement, le temps de
  la visite (`sessionStorage`), que l'écran de chargement et le booster ont déjà été vus. La boutique SumUp
  intégrée peut déposer ses propres cookies et en demande l'accord.

---

## 9. Fonctionnement des animations

- **Écran de chargement** (accueil, une fois par session) : c'est un vrai chargement. `home.js` lit toutes les
  pages du site, y trouve tous les fichiers utilisés (images, scripts, styles, police, 3D, visuels de la collection
  du catalogue `products.js`) et les télécharge. Le compteur = pourcentage de fichiers déjà téléchargés ; le site
  s'ouvre à 100 %, avec tout dans le cache du navigateur. Rien à tenir à jour : une image ajoutée dans une page est
  trouvée toute seule. Au moins 1,5 s d'animation, au plus 30 s (connexion très lente : la suite continue derrière).
  La boutique SumUp (autre site) est préparée à part et ne compte pas dans le pourcentage.
- **Médaillon 3D** (`pendant.js`) : il descend de la hero jusqu'à la section « Notre logo » en tournant.
- **Défilement aimanté** (ordinateur) : sur l'accueil et la collection, chaque partie fait un écran et la page
  se cale sur la plus proche.
- **Booster** (`collection3d.js`) : tant qu'il n'est pas ouvert, la suite de la page est floutée.
  On l'ouvre en glissant vers la droite ou avec le bouton « Ouvrir ».
- **Tringle 3D** : une tringle sur ordinateur (on la fait glisser), deux tringles sur téléphone
  (pulls en haut, T-shirts en dessous) pour toucher facilement chaque pièce.
- **Mouvement réduit** : si le visiteur a demandé moins d'animations dans les réglages de son appareil,
  le site reste entièrement lisible, sans animation.
- **Sans WebGL** : la tringle est remplacée par une simple liste des pièces.

---

## 10. Avant d'annoncer le site

- [ ] Ajouter les **photos des articles dans SumUp** (les fiches SumUp n'en ont pas encore).
- [ ] Faire une **commande test** sur téléphone et sur ordinateur, puis la rembourser.
- [ ] Vérifier que les **prix et coloris** de `products.js` correspondent à SumUp.
- [ ] Faire relire les **conditions de vente** (rétractation, échanges) dans `infos-legales.html`.
- [ ] Vérifier dans **Settings → Pages** que *Enforce HTTPS* est coché.

---

## 11. Crédits

- **Designs** des vêtements : Josué Trésor Boupana Moukoumi — [@i.w.2.s.u.i.t.f](https://www.instagram.com/i.w.2.s.u.i.t.f/)
- **Broderie et impressions** : Agathe Huguet, Maison Vitali — [@lamaisonvitali](https://www.instagram.com/lamaisonvitali/)
- **Site** : BDE CESI Lille — responsable de la publication : Paul Calais
- Bibliothèques : [GSAP](https://gsap.com) et [Three.js](https://threejs.org) (licences dans leurs fichiers `vendor/`)

## Page d'attente (jusqu'au mardi 24 novembre 2026, 8 h 30)

Jusqu'à l'heure d'ouverture, toutes les pages (sauf les infos légales) renvoient vers `attente.html` :
pull noir en pixels floutés, fond sombre en grille de grands carrés presque noirs (les lignes s'illuminent doucement : case sous le curseur qui s'allume et vague de taille aléatoire au clic gauche sur ordinateur, vagues douces au hasard sur téléphone, jamais dans une autre vague ni derrière le pull, qui rebondissent l'une sur l'autre) ; compteur sur fond blanc, compte à rebours et bouton « Ajouter un rappel » (ouvre la création d'événement de Google Agenda, ou Calendrier sur iPhone/Mac via `rappel.ics`). À 8 h 30 (heure de Paris), le site s'ouvre tout seul et `attente.html` renvoie vers l'accueil.

- **Accès équipe** : appuyer sur le pull au centre de la page d'attente, puis saisir le code. L'accès ne dure que le temps de la visite : un rafraîchissement, un nouvel onglet ou la fermeture du navigateur ramènent sur la page d'attente (rien n'est gardé en mémoire).
  Le code n'est écrit nulle part dans le site : seule son empreinte (PBKDF2-SHA256, 300 000 tours) est enregistrée.
- **Limite** : le site est statique et le dépôt public, donc ce verrou cache le site au public mais n'est pas
  une vraie protection (quelqu'un de technique peut lire les fichiers du dépôt). Ne rien mettre de secret derrière.
- **Changer l'heure d'ouverture** : modifier `OUVERTURE` (millisecondes depuis 1970, en UTC) dans `boot.js` **et** `attente.js`, ainsi que les dates de `rappel.ics` et du lien Google Agenda dans `attente.html`.
- **Ouvrir le site plus tôt** : mettre `OUVERTURE = 0` dans `boot.js`.
- **Changer le code** : calculer la nouvelle empreinte (console du navigateur sur la page d'attente) puis remplacer
  `EMPREINTE` dans `attente.js` et `JETON` dans `boot.js` :
  ```js
  (async c=>{const e=new TextEncoder(),k=await crypto.subtle.importKey("raw",e.encode(c),"PBKDF2",false,["deriveBits"]);
  return [...new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:e.encode("bde-cesi-lille|acces|2026"),iterations:300000},k,256))].map(b=>b.toString(16).padStart(2,"0")).join("")})("NOUVEAUCODE")
  ```
- Après l'ouverture, on peut supprimer `attente.html`, `attente.js` et le bloc « Page d'attente » de `boot.js`.
