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
   - colors[].sumup : libellé sur SumUp ; colors[].print / printLabel : couleur de l'écriture ; prints (T-shirt) : impressions au choix
   - colors[].teinte : couleur du vêtement (pastille du choix de coloris) ; rack (facultatif) : coloris sur la tringle
   - colors[].id : sert aussi à trouver les visuels de la tringle, images/pieces/<pull|tee>-<id>-<face|dos|side>.webp */
// tailles proposées sur SumUp
const SIZES_PULL = ["S", "M", "L", "XL", "XXL"];
const SIZES_TEE = ["XS", "S", "M", "L", "XL", "XXL"];

const PRODUCTS = [
  {
    id: "hoodie",
    name: "Hoodie CESI Lille",
    sumupName: "Pull",
    price: 45,
    // {print} est remplacé par la couleur d'impression de la version (colors[].print)
    desc: "Sweat à capuche en molleton French Terry, coupe standard à épaules légèrement tombantes, capuche doublée avec cordon plat en coton bio, poche kangourou, sans étiquette qui gratte. Logo étoile brodé sur la poitrine, blason CESI Lille 2026-2027 au dos, en {print}.",
    material: "100 % coton biologique peigné, 400 g/m². Intérieur French Terry, lavé aux enzymes. Bords-côtes 2 × 1 aux poignets et en bas, doubles surpiqûres. Certifié GOTS et OEKO-TEX® Standard 100.",
    sizes: SIZES_PULL,
    // Guide des tailles (facultatif) en cm, vêtement posé à plat. A = largeur de poitrine, B = longueur totale :
    // guideTable: { S: [A, B], M: [A, B], ... }, guideNote: "…". Sans guideTable, la fiche n'affiche pas de guide.
    // une version = un coloris + une écriture (libellés exacts de SumUp, « Couleur Pull »)
    colors: [
      { id: "noir-blanc",    name: "Noir",      sumup: "Noir (écriture blanche)",           print: "blanc",           printLabel: "Écriture blanche",         teinte: "#28282a" },
      { id: "noir-rouge",    name: "Noir",      sumup: "Noir (écriture rouge)",             print: "rouge",           printLabel: "Écriture rouge",           teinte: "#28282a" },
      { id: "ivoire-marron", name: "Ivoire",    sumup: "Ivoire (écriture marron)",          print: "marron",          printLabel: "Écriture marron",          teinte: "#f0ede6" },
      { id: "ivoire-bleu",   name: "Ivoire",    sumup: "Ivoire (écriture bleu électrique)", print: "bleu électrique", printLabel: "Écriture bleu électrique", teinte: "#f0ede6" },
      { id: "marine-blanc",  name: "Bleu Navy", sumup: "Bleu Navy (écriture blanche)",      print: "blanc",           printLabel: "Écriture blanche",         teinte: "#1d2433" },
      { id: "marine-rose",   name: "Bleu Navy", sumup: "Bleu Navy (écriture rose pâle)",    print: "rose pâle",       printLabel: "Écriture rose pâle",       teinte: "#1d2433" }
    ]
  },
  {
    id: "tshirt",
    name: "T-shirt CESI Lille",
    sumupName: "T-shirt",
    price: 25,
    desc: "T-shirt en jersey de coton, coupe droite, col rond en bord-côte. Devant, le logo étoile CESI sur le cœur ; au dos, « CESI Lille » en grandes lettres autour du blason, avec 2026-2027, en {print}.",
    material: "100 % coton, 185 g/m² (gris cendré : 99 % coton et 1 % viscose ; gris chiné : 90 % coton et 10 % viscose). Maille jersey tubulaire, col bord-côte 1 × 1, ourlets double aiguille. Certifié OEKO-TEX® Standard 100.",
    sizes: SIZES_TEE,
    // coloris accrochés sur la tringle ; les autres se choisissent dans la fiche (partie « Personnalisation »)
    rack: ["Blanc", "Rouge", "Orange", "Jaune", "Vert clair", "Bleu roi", "Noir"],
    rackTel: ["Blanc", "Rouge", "Vert clair", "Bleu roi", "Noir"],   // sur téléphone (sans le jaune ni l'orange)
    // T-shirt : coloris et impression se choisissent séparément, toutes les combinaisons sont possibles
    // (libellés de SumUp, « Impression T-Shirt (couleur) » ; name : nom affiché, teinte : pastille)
    prints: [
      { name: "noir", sumup: "noir", teinte: "#1d1d1f" },
      { name: "blanc", sumup: "blanc", teinte: "#ffffff" },
      { name: "rose", sumup: "rose", teinte: "#f3b5c9" },
      { name: "vert forêt", sumup: "vert forêt", teinte: "#2f4a36" },
      { name: "vert clair", sumup: "vert clair", teinte: "#4cc27a" },
      { name: "rouge", sumup: "rouge", teinte: "#c8102e" },
      { name: "bleu foncé", sumup: "bleu foncé", teinte: "#1c2741" },
      { name: "bleu ciel", sumup: "bleu ciel", teinte: "#8cc1ea" },
      { name: "bleu électrique", sumup: "bleu électrique", teinte: "#1f33c4" },
      { name: "gris", sumup: "gris", teinte: "#9a9ba0" },
      { name: "violet (pourpre)", sumup: "violet(pourpre)", teinte: "#6a2c91" },
      { name: "jaune", sumup: "jaune", teinte: "#f5c400" },
      { name: "beige (crème)", sumup: "beige (crême)", teinte: "#efe5cf" },
      { name: "orange", sumup: "orange", teinte: "#ee6a1e" },
      { name: "marron", sumup: "marron", teinte: "#4e3328" },
      { name: "bordeaux", sumup: "bordeau", teinte: "#6b1f2e" },
      { name: "fuchsia (violet)", sumup: "fushia(violet)", teinte: "#c2187a" }
    ],
    // les visuels : un par coloris (avec l'impression de la photo), deux pour le blanc et le noir
    // (libellés exacts de SumUp, « Couleurs T-Shirt »)
    colors: [
      { id: "blanc-noir",      name: "Blanc",           sumup: "Blanc",           print: "noir",           teinte: "#f4f5f8" },
      { id: "blanc-rose",      name: "Blanc",           sumup: "Blanc",           print: "rose",           teinte: "#f4f5f8" },
      { id: "noir-blanc",      name: "Noir",            sumup: "Noir",            print: "blanc",          teinte: "#28282a" },
      { id: "noir-rouge",      name: "Noir",            sumup: "Noir",            print: "rouge",          teinte: "#28282a" },
      { id: "gris-chine",      name: "Gris cendré",     sumup: "Gris cendré",     print: "noir",           teinte: "#dedfe3" },
      { id: "bleu-atoll",      name: "Bleu atoll",      sumup: "Bleu atoll",      print: "blanc",          teinte: "#1989ad" },
      { id: "bordeaux",        name: "Bordeaux",        sumup: "Bordeaux",        print: "blanc",          teinte: "#532d38" },
      { id: "gris-fonce",      name: "Gris foncé",      sumup: "Gris foncé",      print: "blanc",          teinte: "#46484d" },
      { id: "vert-foret",      name: "Vert forêt",      sumup: "Vert forêt",      print: "beige (crème)",  teinte: "#2f4234" },
      { id: "fuchsia",         name: "Fuchsia",         sumup: "Fuchsia",         print: "blanc",          teinte: "#d24b73" },
      { id: "or",              name: "Jaune",           sumup: "Jaune",           print: "noir",           teinte: "#fab119" },
      { id: "vert-prairie",    name: "Vert clair",      sumup: "Vert clair",      print: "blanc",          teinte: "#198653" },
      { id: "marine",          name: "Bleu marine",     sumup: "Bleu marine",     print: "blanc",          teinte: "#252c33" },
      { id: "orange",          name: "Orange",          sumup: "Orange",          print: "noir",           teinte: "#ee5a1e" },
      { id: "gris-oxford",     name: "Gris chiné",      sumup: "Gris chiné",      print: "noir",           teinte: "#a7a8ae" },
      { id: "gris-pacifique",  name: "Gris pacifique",  sumup: "Gris pacifique",  print: "blanc",          teinte: "#acb1b2" },
      { id: "naturel",         name: "Naturel",         sumup: "Naturel",         print: "marron",         teinte: "#efe5d4" },
      { id: "rouge",           name: "Rouge",           sumup: "Rouge",           print: "blanc",          teinte: "#b32231" },
      { id: "bleu-roi",        name: "Bleu roi",        sumup: "Bleu roi",        print: "blanc",          teinte: "#19548f" },
      { id: "sable",           name: "Sable",           sumup: "Sable",           print: "marron",         teinte: "#baa58d" },
      { id: "bleu-ciel",       name: "Bleu ciel",       sumup: "Bleu ciel",       print: "bleu foncé",     teinte: "#7cadd3" },
      { id: "kaki",            name: "Kaki",            sumup: "Kaki",            print: "beige (crème)",  teinte: "#48473c" }
    ]
  }
  // Pack T-shirt + Pull (62,99 € sur SumUp, soit 10 % de moins que les deux achetés séparément) :
  // https://bde-cesi-lille.sumupstore.com/product/pack-t-shirt-pull-1 (dans boutique.html ; pas sur la tringle)
];
