# Boutique CESI Lille : guide de mise en ligne (paiement SumUp)

Le site **présente** les produits ; la **commande et le paiement par carte** se font sur la boutique en ligne SumUp. Le site ne touche jamais aux paiements ni aux données bancaires.
Tout le contenu se règle dans **`assets/js/products.js`**.

## Le produit
- **Base** : sweat à capuche **AWDis Just Hoods JH120 « Signature Heavyweight Hoodie »** (La Maison du Tee-shirt) : 70 % coton ringspun / 30 % polyester recyclé (gris chiné : 60 / 40), 440 g/m², intérieur gratté, capuche trois pans sans cordon, poche kangourou et poche intérieure pour téléphone, coupe oversize.
- **Prix de vente** : 44,99 €. **Design** : « CESI Lille » au dos.
- **Quatre coloris** : Noir, Gris chiné, Marron, Écru. Vérifiez les noms exacts du fournisseur au moment de commander (probablement Deep black, Heather grey, Espresso et Vanilla milkshake ou Natural stone : comparez avec les nuanciers).
- **Tailles proposées sur le site** : S à XXL. Le fournisseur propose aussi XS et 3XL (mesures déjà dans `assets/js/products.js`) : ajoutez-les dans `sizes` si vous voulez les vendre.
- **Boutique de paiement** : 4 coloris × 5 tailles = **20 variantes** à créer (ex. « Hoodie CESI Lille – Marron – M »), chacune avec son stock.
- **Fichiers d'impression** : `design/print/logo-dos-blanc.png` (pour les coloris foncés) et `design/print/logo-dos-noir.png` (pour les clairs), fond transparent. L'impression blanche sur noir/marron et noire sur gris/écru est mon hypothèse : confirmez avec l'imprimeur (technique, dimensions, emplacement).
- Les images du dos sur le site sont des **aperçus du design** sur la couleur du vêtement, pas des photos du produit fini. Remplacez-les par de vraies photos dès que vous avez un exemplaire.

## Le logo 3D du fond
Le logo chromé tourne en 3D derrière un verre dépoli très léger sans contour (`assets/js/logo3d.js`, WebGL, un tour en 30 s ; réglable en haut du fichier, constante `TURN`). Si l'appareil n'a pas WebGL, si l'utilisateur a demandé moins d'animations, ou si l'image ne charge pas, le logo reste fixe en image : rien ne casse. Il est en pause quand l'onglet est caché. La texture du logo est aussi intégrée dans `assets/js/logo-tex.js` : la 3D fonctionne même en ouvrant `index.html` directement sur votre ordinateur (sans serveur). Il s'attarde de face et de dos et passe vite de profil.js`).

## Menu et en-tête
L'en-tête affiche un menu burger à gauche, le logo « CESI Lille » (`assets/images/brand/logo-header.png`) exactement au centre, et le panier à droite. Les liens du menu sont dans le bloc `<nav class="drawer">` de chaque page ; le comportement est dans `assets/js/menu.js`.

## 1. Ouvrir et vérifier le compte SumUp
1. Créez un compte SumUp sur sumup.com (application **SumUp Business** ou site). SumUp demande de déclarer votre **statut** (indépendant, association, société…) et impose une **vérification d'identité**, que seul le titulaire peut faire.
2. Les fonds arrivent sur ce compte : ouvrez-le au nom de la structure qui vend (association, micro-entreprise…), pas d'une personne sans cadre. En cas de doute sur le statut, renseignez-vous avant de vendre.

## 2. Créer la boutique SumUp (recommandé)
SumUp propose une **boutique en ligne gratuite** (0 €/mois à la création) reliée directement à votre compte.
1. Dans SumUp : **Boutique en ligne**, créez la boutique.
2. Ajoutez le hoodie avec ses **options** (Couleur : Noir, Gris chiné, Marron, Écru ; Taille : S à XXL) : SumUp en fait des variantes (jusqu'à 300 par article) avec un **stock par variante**. Réglez le stock sur la quantité de la série (pas de réédition).
3. Livraison : désactivez-la et activez **uniquement le retrait sur place** (campus de Lille).
4. Prix identiques à ceux de `assets/js/products.js`. Mentionnez dans la description : « Retrait sur le campus de Lille. »
5. Copiez l'adresse de la boutique et collez-la dans **`shopUrl`** de `assets/js/products.js`.

**Frais** (relevés fin 2026, à vérifier sur sumup.com) : environ 2,5 % par paiement en ligne, sans abonnement (une page de SumUp annonce 2,75 % pour la boutique en ligne). Soit environ 3,25 € sur un hoodie à 129,95 €.

## 3. Autres façons de payer avec SumUp
- **Liens de paiement** (2,5 %, sans abonnement) : un lien par montant, créé dans l'application. Pratique pour 1 ou 2 produits, lourd avec tailles et couleurs (un lien par taille). Collez le lien dans `shopUrl`, ou dans `buyUrl` d'un produit.
- **API SumUp (paiement intégré à un site)** : nécessite un petit serveur pour garder la clé secrète. Inutile ici ; à envisager seulement si la boutique SumUp ne suffit pas.

## 4. Brancher le site
Dans `assets/js/products.js` : `shopUrl`, `contactEmail`, et si vous voulez `payLabel` (texte du bouton), `payNote` (mention sous le bouton) et `preorderEnd` (ex. `"2026-12-15"`).
- Tant que `shopUrl` est vide, les boutons affichent « Précommandes bientôt ouvertes » (aucun lien cassé).
- Seules les adresses `https://` valides sont acceptées. Option : `trustedHosts: ["sumup.com"]` pour n'autoriser que ce domaine (testez d'abord : si le bouton reste grisé, l'adresse de votre boutique est sur un autre domaine).
- Un produit peut avoir sa propre adresse : `buyUrl: "https://..."`.
- Pour revenir à HelloAsso ou autre plateforme : collez simplement son adresse dans `shopUrl`.

## 5. Le T-shirt
Pages de vente : `tshirt.html` (T-shirt) et `hoodie.html` (hoodie), qui se partagent comme n'importe quelle adresse ; `boutique.html` liste les deux. Le contenu est dans `assets/js/products.js` (produit `tshirt`).
- **Images** : `black-face.jpg` (devant) et `black-dos.jpg` (dos) sont tirées des maquettes fournies, détourées sur fond clair. Leur définition est modeste (maquettes de ~650 px de haut) : remplacez-les par des visuels plus nets ou de vraies photos dès que possible.
- **Prix** : `price` est vide, donc la page affiche « Prix bientôt annoncé ». Renseignez-le (ex. `24.99`).
- **Coloris** : seul le noir est présenté (les designs sont clairs, prévus pour fond foncé). Pour en ajouter, copiez le bloc de couleur dans `colors` avec ses images.
- **Matière et guide des tailles** : facultatifs, à décommenter dans `assets/js/products.js` avec les informations du fournisseur (rien n'est affiché tant qu'ils sont absents).
- Créez le T-shirt avec ses tailles dans la boutique SumUp, comme le hoodie.

## 6. Avant d'ouvrir
- **`infos-legales.html`** : remplacez chaque passage surligné entre crochets (mentions légales, conditions de vente, confidentialité) et faites relire. Vérifiez notamment le droit de rétractation.
- L'adresse de contact (`bde-lille@viacesi.fr`) est déjà renseignée dans `assets/js/products.js` et les pages. Remplacez les liens Instagram et TikTok du pied de page par vos comptes.

## 7. Mise en ligne : Netlify ou GitHub Pages (au choix, gratuits)

### Option A : GitHub Pages
1. Créez un compte GitHub gratuit, puis un **nouveau dépôt public** (ex. `cesi-lille-shop`). Le site ne contient aucun secret ; avec l'offre gratuite, GitHub Pages demande en général un dépôt public (à vérifier dans vos réglages).
2. **Add file > Upload files** : glissez le **contenu** du dossier (`index.html` doit être à la racine du dépôt, pas dans un sous-dossier), avec les dossiers `assets/` et `docs/` si vous le souhaitez (`assets/` est indispensable). Validez (**Commit**).
3. **Settings > Pages** : Source « Deploy from a branch », branche `main`, dossier `/ (root)`. Au bout d'une ou deux minutes, le site répond sur `https://VOTRE-COMPTE.github.io/NOM-DU-DEPOT/`.
4. **Domaine** : dans Settings > Pages > Custom domain, saisissez votre domaine (de préférence `www.votredomaine.fr`) et enregistrez **avant** de modifier le DNS. Puis, chez votre registrar :
   - `www` : enregistrement **CNAME** vers `VOTRE-COMPTE.github.io`.
   - domaine sans `www` : quatre enregistrements **A** vers `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub redirige alors vers `www`).
   - Supprimez les autres enregistrements A, AAAA ou ALIAS du même nom : ils peuvent empêcher la création du certificat HTTPS.
5. Cochez **Enforce HTTPS** (la case peut mettre jusqu'à 24 h à apparaître).
6. Pour modifier le site : ouvrez un fichier dans GitHub (icône crayon) ou renvoyez-le ; la mise à jour est publiée en une à deux minutes.
Limite : GitHub Pages ignore le fichier `_headers` (pas d'en-têtes de sécurité comme l'anti-intégration dans d'autres sites). La politique CSP incluse dans chaque page reste active ; le risque est faible pour un site vitrine sans compte client.

### Option B : Netlify
Glissez le dossier sur netlify.com/drop avec un compte gratuit : le fichier `_headers` applique alors les protections. Domaine : ajoutez-le dans les réglages du site, puis chez votre registrar `www` en CNAME vers `VOTRE-SITE.netlify.app` et, pour le domaine sans `www`, un ALIAS/ANAME vers `apex-loadbalancer.netlify.com` ou un enregistrement A vers `75.2.60.5` (supprimez les AAAA). Choisissez `www` comme domaine principal.

## 8. Test avant l'annonce
1. Ouvrez le site sur un téléphone et un ordinateur, cliquez « Précommander » : la bonne boutique s'ouvre.
2. Faites une commande test avec votre propre carte : vérifiez la confirmation par e-mail, le stock, le retrait sur place, puis remboursez-la.
3. Vérifiez qu'une variante épuisée n'est plus commandable.
