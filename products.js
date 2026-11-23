/* =====================================================================
   RÉGLAGES + CATALOGUE : le seul fichier à modifier pour le contenu
   ===================================================================== */
const SHOP = {
  // Adresse de votre boutique de paiement (SumUp, HelloAsso ou autre) : doit commencer par https://
  // Tant qu'elle est vide, les boutons affichent « Précommandes bientôt ouvertes » (aucun lien cassé).
  shopUrl: "https://bde-cesi-lille.sumupstore.com/",   // la boutique SumUp du BDE (le panier y est envoyé pour le paiement)
  payLabel: "Précommander",                          // texte du bouton
  payNote: "Paiement par carte sécurisé par SumUp.", // petite mention sous le bouton ("" pour la retirer)
  trustedHosts: ["sumupstore.com"],                  // seuls les liens vers ces domaines sont acceptés
  contactEmail: "bde-cesi-lille@viacesi.fr",
  // Facultatif : adresse Formspree pour recevoir les inscriptions « Reste informé » (sinon, ouverture de la messagerie)
  newsletterEndpoint: "",
  // Facultatif : adresse Formspree (https://formspree.io/f/...) pour recevoir le formulaire de la page Contact
  // sans passer par la messagerie du visiteur. Vide = le formulaire ouvre la messagerie avec le message pré-rempli.
  contactEndpoint: "",
  // Date et heure limites des précommandes, heure de Paris : "2026-11-26T18:00" ("" = pas de date ; "2026-12-15" seul = jusqu'à 23 h 59).
  // Affichée en haut de la page Boutique ; une fois passée, la boutique intégrée est remplacée par « Précommandes terminées ».
  // Pensez aussi à fermer la boutique SumUp à la même heure : c'est elle qui accepte les commandes.
  preorderEnd: "2026-11-26T18:00"
};

/* Un produit = des couleurs, chacune avec ses images.
   Tout correspond à la boutique SumUp du BDE : mêmes articles, prix, tailles et couleurs.
   - sumupName / sumupUrl : nom et page de l'article sur SumUp
   - colors[].sumup : libellé exact de la couleur sur SumUp
   La commande se fait dans la page SumUp de l'article, intégrée à la fiche produit (le panier SumUp est aussi intégré, icône en haut).
   Les photos des autres coloris ne sont pas encore prêtes : en attendant, ils reprennent les photos du noir. */
const PULL_IMG = [
  { src: "images/sweat-face.jpg", thumb: "images/t-sweat-face.jpg", alt: "Hoodie CESI Lille, vue de face" },
  { src: "images/sweat-dos.jpg",  thumb: "images/t-sweat-dos.jpg",  alt: "Hoodie CESI Lille, dos : blason CESI Lille et 2026-2027" }
];
const TEE_IMG = [
  { src: "images/tshirt-black-face.jpg", thumb: "images/tt-black-face.jpg", alt: "T-shirt CESI Lille, devant : petit logo en haut du torse" },
  { src: "images/tshirt-black-dos.jpg",  thumb: "images/tt-black-dos.jpg",  alt: "T-shirt CESI Lille, dos : grande illustration au trait et texte manuscrit" }
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const PRODUCTS = [
  {
    id: "hoodie",
    name: "Hoodie CESI Lille",
    sumupName: "Pull",
    sumupUrl: "https://bde-cesi-lille.sumupstore.com/product/pull",
    price: 45,
    tag: "Édition limitée 2026-2027",
    // {print} est remplacé par la couleur d'impression du coloris (colors[].print)
    desc: "Sweat à capuche à coupe oversize, épaules tombantes, poche kangourou et intérieur gratté. Petit logo étoile sur la poitrine et blason CESI Lille 2026-2027 au dos, imprimés en {print}.",
    material: "70 % coton, 30 % polyester. 330 g/m², intérieur gratté. Poignets et ourlet côtelés.",
    sizes: SIZES,
    // Guide des tailles en cm, vêtement posé à plat. A = largeur de poitrine, B = longueur totale.
    guideTable: { S: [58, 68], M: [61, 69], L: [64, 71], XL: [67, 73], XXL: [70, 75], "3XL": [74.5, 76] },
    guideNote: "Tolérance de fabrication : ± 2 cm.",
    colors: [
      // print / printLabel : couleur réelle de l'impression, d'après les visuels finaux (le libellé SumUp reste inchangé)
      { id: "noir",  name: "Noir",  sumup: "Noir (écriture blanche)",  print: "blanc",  printLabel: "Impression blanche", hex: "#1d1d1f", images: PULL_IMG },
      { id: "beige", name: "Beige", sumup: "Beige (écriture noire)",   print: "marron", printLabel: "Impression marron",  hex: "#ece4d0", images: PULL_IMG },
      { id: "bleu",  name: "Bleu",  sumup: "Bleu (écriture blanche)",  print: "blanc",  printLabel: "Impression blanche", hex: "#232b4f", images: PULL_IMG }
    ]
  }

  ,{
    id: "tshirt",
    name: "T-shirt CESI Lille",
    sumupName: "T-shirt",
    sumupUrl: "https://bde-cesi-lille.sumupstore.com/product/t-shirt",
    price: 25,
    tag: "Édition limitée 2026-2027",
    desc: "Le T-shirt CESI Lille, avec deux faces : devant, un petit logo en haut du torse ; au dos, une grande illustration au trait accompagnée d'un texte manuscrit sur Lille et ses étudiants. Impression blanche ou crème selon le coloris.",
    sizes: SIZES,
    colors: [
      { id: "noir",     name: "Noir",        sumup: "Noir (écriture blanche)",        hex: "#141414", images: TEE_IMG },
      { id: "marron",   name: "Marron",      sumup: "Marron (écriture Crème)",        hex: "#5b3e2c", images: TEE_IMG },
      { id: "rose",     name: "Rose clair",  sumup: "Rose clair (écriture blanche)",  hex: "#efc6cc", images: TEE_IMG },
      { id: "vert",     name: "Vert forêt",  sumup: "Vert forêt (écriture blanche)",  hex: "#24493a", images: TEE_IMG },
      { id: "bordeaux", name: "Bordeaux",    sumup: "Bordeaux (écriture crème)",      hex: "#6b1f2d", images: TEE_IMG }
    ]
  }
  // Pack T-shirt + Pull (65 € sur SumUp) : à ajouter ici quand il sera finalisé.
];