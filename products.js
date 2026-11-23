/* =====================================================================
   RÉGLAGES + CATALOGUE : le fichier à modifier pour le contenu des fiches produit (page Collection)
   ===================================================================== */
const SHOP = {
  contactEmail: "bde-lille@viacesi.fr",
  // Facultatif : adresse Formspree (https://formspree.io/f/...) pour recevoir le formulaire de la page Contact
  // sans passer par la messagerie du visiteur. Vide = le formulaire ouvre la messagerie avec le message prérempli.
  // Si vous la renseignez, ajoutez aussi https://formspree.io à connect-src et form-action dans la ligne
  // Content-Security-Policy de contact.html (sinon le navigateur bloque l'envoi).
  contactEndpoint: ""
};

/* Un produit = une ou plusieurs couleurs. Tout correspond à la boutique SumUp du BDE : mêmes articles, prix,
   tailles et couleurs.
   - sumupName : nom de l'article sur SumUp (les liens vers SumUp sont dans boutique.html)
   - colors[].sumup : libellé exact de la couleur sur SumUp (affiché sous le nom dans la fiche)
   - colors[].id : sert aussi à trouver les visuels de la tringle, images/pieces/<pull|tee>-<id>-<face|dos|side>.png */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const PRODUCTS = [
  {
    id: "hoodie",
    name: "Hoodie CESI Lille",
    sumupName: "Pull",
    price: 45,
    // {print} est remplacé par la couleur d'impression du coloris (colors[].print)
    desc: "Sweat à capuche à coupe oversize, épaules tombantes, poche kangourou et intérieur gratté. Logo étoile brodé sur la poitrine, blason CESI Lille 2026-2027 imprimé au dos, en {print}.",
    material: "70 % coton, 30 % polyester. 330 g/m², intérieur gratté. Poignets et ourlet côtelés.",
    sizes: SIZES,
    // Guide des tailles en cm, vêtement posé à plat. A = largeur de poitrine, B = longueur totale.
    guideTable: { S: [58, 68], M: [61, 69], L: [64, 71], XL: [67, 73], XXL: [70, 75], "3XL": [74.5, 76] },
    guideNote: "Tolérance de fabrication : ± 2 cm.",
    colors: [
      // print / printLabel : couleur réelle de l'impression, d'après les visuels finaux (le libellé SumUp reste inchangé)
      { id: "noir",  name: "Noir",  sumup: "Noir (écriture blanche)",  print: "blanc",  printLabel: "Impression blanche" },
      { id: "beige", name: "Beige", sumup: "Beige (écriture noire)",   print: "marron", printLabel: "Impression marron" },
      { id: "bleu",  name: "Bleu",  sumup: "Bleu (écriture blanche)",  print: "blanc",  printLabel: "Impression blanche" }
    ]
  },
  {
    id: "tshirt",
    name: "T-shirt CESI Lille",
    sumupName: "T-shirt",
    price: 25,
    desc: "Le T-shirt CESI Lille : devant, un petit logo étoile sur le cœur ; au dos, « CESI Lille » en grandes lettres autour du blason, avec 2026-2027. Impression blanche ou crème selon le coloris.",
    sizes: SIZES,
    colors: [
      { id: "noir",     name: "Noir",        sumup: "Noir (écriture blanche)" },
      { id: "marron",   name: "Marron",      sumup: "Marron (écriture Crème)" },
      { id: "rose",     name: "Rose clair",  sumup: "Rose clair (écriture blanche)" },
      { id: "vert",     name: "Vert forêt",  sumup: "Vert forêt (écriture blanche)" },
      { id: "bordeaux", name: "Bordeaux",    sumup: "Bordeaux (écriture crème)" }
    ]
  }
  // Pack T-shirt + Pull (65 € sur SumUp) : https://bde-cesi-lille.sumupstore.com/product/pack-t-shirt-pull-1
  // (carte présente sur la boutique version téléphone ; à ajouter ici s'il doit aussi apparaître sur la tringle)
];
