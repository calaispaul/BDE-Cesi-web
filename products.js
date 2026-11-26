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

/* Un produit = une ou plusieurs versions (coloris du vêtement + couleur d'impression). Tout doit correspondre à la
   boutique SumUp du BDE : mêmes articles, prix, tailles et versions.
   - sumupName : nom de l'article sur SumUp (les liens vers SumUp sont dans boutique.html)
   - colors[].sumup : libellé de la version sur SumUp ; colors[].print / printLabel : couleur de l'impression
   - colors[].id : sert aussi à trouver les visuels de la tringle, images/pieces/<pull|tee>-<id>-<face|dos|side>.webp */
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const PRODUCTS = [
  {
    id: "hoodie",
    name: "Hoodie CESI Lille",
    sumupName: "Pull",
    price: 45,
    // {print} est remplacé par la couleur d'impression de la version (colors[].print)
    desc: "Sweat à capuche Native Spirit en molleton French Terry, coupe standard à épaules légèrement tombantes, capuche doublée avec cordon plat en coton bio, poche kangourou, sans étiquette qui gratte. Logo étoile brodé sur la poitrine, blason CESI Lille 2026-2027 au dos, en {print}.",
    material: "100 % coton biologique peigné, 400 g/m². Intérieur French Terry, lavé aux enzymes. Bords-côtes 2 × 1 aux poignets et en bas, doubles surpiqûres. Certifié GOTS et OEKO-TEX® Standard 100 (Native Spirit NS431).",
    sizes: SIZES,
    // Guide des tailles (facultatif) en cm, vêtement posé à plat. A = largeur de poitrine, B = longueur totale :
    // guideTable: { S: [A, B], M: [A, B], ... }, guideNote: "…". Sans guideTable, la fiche n'affiche pas de guide.
    colors: [
      { id: "noir-blanc", name: "Noir", sumup: "Noir (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "noir-rouge", name: "Noir", sumup: "Noir (impression rouge)", print: "rouge", printLabel: "Impression rouge" },
      { id: "ivoire-marron", name: "Ivoire", sumup: "Ivoire (impression marron)", print: "marron", printLabel: "Impression marron" },
      { id: "ivoire-bleu", name: "Ivoire", sumup: "Ivoire (impression bleue)", print: "bleu", printLabel: "Impression bleue" },
      { id: "marine-blanc", name: "Bleu marine", sumup: "Bleu marine (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "marine-rose", name: "Bleu marine", sumup: "Bleu marine (impression rose)", print: "rose", printLabel: "Impression rose" }
    ]
  },
  {
    id: "tshirt",
    name: "T-shirt CESI Lille",
    sumupName: "T-shirt",
    price: 25,
    desc: "T-shirt iDeal190 en jersey de coton, coupe droite, col rond en bord-côte. Devant, le logo étoile CESI sur le cœur ; au dos, « CESI Lille » en grandes lettres autour du blason, avec 2026-2027, en {print}.",
    material: "100 % coton, 185 g/m² (gris chiné : 99 % coton et 1 % viscose ; gris oxford : 90 % coton et 10 % viscose). Maille jersey tubulaire, col bord-côte 1 × 1, ourlets double aiguille. Certifié OEKO-TEX® Standard 100 (iDeal IB320).",
    sizes: SIZES,
    colors: [
      { id: "blanc-noir", name: "Blanc", sumup: "Blanc (impression noire)", print: "noir", printLabel: "Impression noire" },
      { id: "blanc-rose", name: "Blanc", sumup: "Blanc (impression rose)", print: "rose", printLabel: "Impression rose" },
      { id: "noir-blanc", name: "Noir", sumup: "Noir (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "noir-rouge", name: "Noir", sumup: "Noir (impression rouge)", print: "rouge", printLabel: "Impression rouge" },
      { id: "gris-chine", name: "Gris chiné", sumup: "Gris chiné (impression noire)", print: "noir", printLabel: "Impression noire" },
      { id: "gris-oxford", name: "Gris oxford", sumup: "Gris oxford (impression noire)", print: "noir", printLabel: "Impression noire" },
      { id: "gris-pacifique", name: "Gris pacifique", sumup: "Gris pacifique (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "gris-fonce", name: "Gris foncé", sumup: "Gris foncé (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "naturel", name: "Naturel", sumup: "Naturel (impression marron)", print: "marron", printLabel: "Impression marron" },
      { id: "sable", name: "Sable", sumup: "Sable (impression marron)", print: "marron", printLabel: "Impression marron" },
      { id: "or", name: "Jaune or", sumup: "Jaune or (impression noire)", print: "noir", printLabel: "Impression noire" },
      { id: "orange", name: "Orange", sumup: "Orange (impression noire)", print: "noir", printLabel: "Impression noire" },
      { id: "rouge", name: "Rouge", sumup: "Rouge (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "fuchsia", name: "Fuchsia", sumup: "Fuchsia (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "bordeaux", name: "Bordeaux", sumup: "Bordeaux (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "bleu-ciel", name: "Bleu ciel", sumup: "Bleu ciel (impression bleu marine)", print: "bleu marine", printLabel: "Impression bleu marine" },
      { id: "bleu-atoll", name: "Bleu atoll", sumup: "Bleu atoll (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "bleu-roi", name: "Bleu roi", sumup: "Bleu roi (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "marine", name: "Bleu marine", sumup: "Bleu marine (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "vert-prairie", name: "Vert prairie", sumup: "Vert prairie (impression blanche)", print: "blanc", printLabel: "Impression blanche" },
      { id: "vert-foret", name: "Vert forêt", sumup: "Vert forêt (impression crème)", print: "crème", printLabel: "Impression crème" },
      { id: "kaki", name: "Kaki", sumup: "Kaki (impression crème)", print: "crème", printLabel: "Impression crème" }
    ]
  }
  // Pack T-shirt + Pull (62,99 € sur SumUp, soit 10 % de moins que les deux achetés séparément) :
  // https://bde-cesi-lille.sumupstore.com/product/pack-t-shirt-pull-1 (dans boutique.html ; pas sur la tringle)
];
