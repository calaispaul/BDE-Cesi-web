/* =====================================================================
   RÉGLAGES + CATALOGUE : le seul fichier à modifier pour le contenu
   ===================================================================== */
const SHOP = {
  // Adresse de votre boutique de paiement (SumUp, HelloAsso ou autre) : doit commencer par https://
  // Tant qu'elle est vide, les boutons affichent « Précommandes bientôt ouvertes » (aucun lien cassé).
  shopUrl: "",
  payLabel: "Précommander",                          // texte du bouton
  payNote: "Paiement par carte sécurisé par SumUp.", // petite mention sous le bouton ("" pour la retirer)
  trustedHosts: [],                                  // facultatif : ["sumup.com"] n'accepte que ces domaines
  contactEmail: "bde-lille@viacesi.fr",
  // Facultatif : adresse Formspree pour recevoir les inscriptions « Reste informé » (sinon, ouverture de la messagerie)
  newsletterEndpoint: "",
  // Date limite des précommandes, au format "2026-12-15" ("" = pas de date). Après cette date, les boutons se désactivent.
  preorderEnd: ""
};

/* Un produit = des couleurs, chacune avec ses images.
   Les tailles et les couleurs se choisissent sur la boutique de paiement : le site ne sert qu'à les présenter.
   Si un produit a sa propre page de paiement, ajoutez buyUrl: "https://..." au produit. */
const PRODUCTS = [
  {
    id: "hoodie",
    name: "Hoodie CESI Lille",
    price: 44.99,
    tag: "Édition limitée 2026-2027",
    desc: "Sweat à capuche oversize en molleton épais (440 g/m²), intérieur gratté, capuche trois pans doublée, grande poche kangourou et poche intérieure pour téléphone. Le design CESI Lille est imprimé au dos.",
    material: "70 % coton ringspun, 30 % polyester recyclé (gris chiné : 60 % / 40 %). 440 g/m², intérieur brossé. Poignets et ourlets côtelés, capuche sans cordon de serrage. Entretien : suivre l'étiquette du vêtement.",
    sizes: ["S", "M", "L", "XL", "XXL"],      // le fournisseur propose aussi XS et 3XL : ajoutez-les ici et dans le guide
    guide: { XS: "largeur 48,5 cm · longueur 66 cm", S: "largeur 53,5 cm · longueur 68 cm", M: "largeur 58,5 cm · longueur 70 cm", L: "largeur 63,5 cm · longueur 72 cm", XL: "largeur 67 cm · longueur 74 cm", XXL: "largeur 70,5 cm · longueur 76 cm", "3XL": "largeur 74 cm · longueur 78 cm" },
    guideNote: "Tolérance de fabrication : ± 2 cm.",
    colors: [
      {
        id: "black", name: "Noir", hex: "#292728",
        images: [
          { src: "images/hoodie-black-face.jpg", thumb: "images/t-black-face.jpg", alt: "Hoodie CESI Lille noir, vue de face" },
          { src: "images/hoodie-black-dos.jpg",  thumb: "images/t-black-dos.jpg",  alt: "Aperçu du design CESI Lille au dos, impression blanc sur fond noir" }
        ]
      },
      {
        id: "grey", name: "Gris chiné", hex: "#d5d2dd",
        images: [
          { src: "images/hoodie-grey-face.jpg", thumb: "images/t-grey-face.jpg", alt: "Hoodie CESI Lille gris chiné, vue de face" },
          { src: "images/hoodie-grey-dos.jpg",  thumb: "images/t-grey-dos.jpg",  alt: "Aperçu du design CESI Lille au dos, impression noir sur fond gris chiné" }
        ]
      },
      {
        id: "brown", name: "Marron", hex: "#48342e",
        images: [
          { src: "images/hoodie-brown-face.jpg", thumb: "images/t-brown-face.jpg", alt: "Hoodie CESI Lille marron, vue de face" },
          { src: "images/hoodie-brown-dos.jpg",  thumb: "images/t-brown-dos.jpg",  alt: "Aperçu du design CESI Lille au dos, impression blanc sur fond marron" }
        ]
      },
      {
        id: "cream", name: "Écru", hex: "#e4d8cf",
        images: [
          { src: "images/hoodie-cream-face.jpg", thumb: "images/t-cream-face.jpg", alt: "Hoodie CESI Lille écru, vue de face" },
          { src: "images/hoodie-cream-dos.jpg",  thumb: "images/t-cream-dos.jpg",  alt: "Aperçu du design CESI Lille au dos, impression noir sur fond écru" }
        ]
      }
    ]
  }

  ,{
    id: "tshirt",
    name: "T-shirt CESI Lille",
    price: null,                    // À RENSEIGNER, ex. 24.99 (tant que c'est vide, le site affiche « Prix bientôt annoncé »)
    tag: "Édition limitée 2026-2027",
    desc: "Le T-shirt CESI Lille, avec deux faces : devant, le logo chromé discret en haut du torse ; au dos, une grande illustration au trait accompagnée d'un texte manuscrit sur Lille et ses étudiants. Impression claire sur fond noir.",
    // material: "...",             // facultatif : composition et entretien (la rubrique « Matière » n'apparaît que si renseigné)
    sizes: ["S", "M", "L", "XL", "XXL"],
    // guide: { S: "largeur 50 cm · longueur 70 cm" },   // facultatif : guide des tailles (à remplir avec les mesures du fournisseur)
    colors: [
      { id: "black", name: "Noir", hex: "#0f1417",
        images: [
          { src: "images/tshirt-black-face.jpg", thumb: "images/tt-black-face.jpg", alt: "T-shirt CESI Lille noir, devant : petit logo chromé en haut du torse" },
          { src: "images/tshirt-black-dos.jpg",  thumb: "images/tt-black-dos.jpg",  alt: "T-shirt CESI Lille noir, dos : grande illustration au trait et texte manuscrit" }
        ] }
      // Autres coloris : ajoutez un bloc { id, name, hex, images:[...] } ici (le design est clair, prévu pour fond foncé)
    ]
  }
];
