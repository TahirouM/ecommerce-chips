export type Category = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
};

export type Product = {
  slug: string;
  name: string;
  short: string; // nom imprimé sur le sachet
  category: string;
  price: number; // en centimes
  compareAtPrice?: number;
  weight: number; // en grammes
  spice: 0 | 1 | 2 | 3;
  color: string;
  emoji: string;
  description: string;
  details: string[];
  rating: number;
  stock: number;
  featured?: boolean;
  isNew?: boolean;
};

export const categories: Category[] = [
  { slug: "classiques", name: "Classiques", description: "Les indémodables, salées juste ce qu'il faut.", emoji: "🥔", color: "#FFD23F" },
  { slug: "relevees", name: "Relevées", description: "Paprika, piment, barbecue : ça pique (un peu, beaucoup).", emoji: "🌶️", color: "#FF8A3D" },
  { slug: "gourmandes", name: "Gourmandes", description: "Des saveurs généreuses pour se faire plaisir.", emoji: "🧀", color: "#8E7BFF" },
  { slug: "legeres", name: "Légères", description: "Cuites au four, légumes et légumineuses.", emoji: "🥕", color: "#2EC4A0" },
  { slug: "packs", name: "Packs", description: "Box et assortiments à partager (ou pas).", emoji: "🎁", color: "#FF5C8A" },
];

export const products: Product[] = [
  {
    slug: "sel-de-mer",
    name: "Sel de mer",
    short: "SEL DE MER",
    category: "classiques",
    price: 249,
    weight: 150,
    spice: 0,
    color: "#FFC21A",
    emoji: "🧂",
    description: "La chips telle qu'on l'aime : fine, dorée, saupoudrée de fleur de sel de Guérande. Simple et parfaite.",
    details: ["Pommes de terre françaises", "Cuites au chaudron en petits lots", "Fleur de sel de Guérande"],
    rating: 4.8,
    stock: 80,
    featured: true,
  },
  {
    slug: "ondulees-nature",
    name: "Ondulées nature",
    short: "ONDULÉES",
    category: "classiques",
    price: 269,
    weight: 150,
    spice: 0,
    color: "#3D7BFF",
    emoji: "🌊",
    description: "Des vagues bien épaisses qui croustillent fort et tiennent tête à toutes les sauces.",
    details: ["Coupe ondulée épaisse", "Huile de tournesol", "Parfaites pour les dips"],
    rating: 4.6,
    stock: 64,
  },
  {
    slug: "sel-vinaigre",
    name: "Sel & vinaigre",
    short: "VINAIGRE",
    category: "classiques",
    price: 259,
    weight: 150,
    spice: 0,
    color: "#2EC4A0",
    emoji: "🫙",
    description: "L'acidulé du vinaigre de cidre et le croquant du sel : un classique britannique qui réveille les papilles.",
    details: ["Vinaigre de cidre de Normandie", "Sans exhausteur de goût", "Vegan"],
    rating: 4.4,
    stock: 40,
  },
  {
    slug: "paprika-fume",
    name: "Paprika fumé",
    short: "PAPRIKA",
    category: "relevees",
    price: 279,
    weight: 150,
    spice: 1,
    color: "#FF8A3D",
    emoji: "🫑",
    description: "Un paprika doux fumé au bois de chêne, pour une chips chaleureuse qui donne envie d'y revenir.",
    details: ["Paprika fumé d'Espagne", "Légèrement relevée", "Vegan"],
    rating: 4.7,
    stock: 55,
    featured: true,
  },
  {
    slug: "jalapeno-citron-vert",
    name: "Jalapeño citron vert",
    short: "JALAPEÑO",
    category: "relevees",
    price: 289,
    weight: 150,
    spice: 2,
    color: "#5BCB3C",
    emoji: "🌶️",
    description: "Le piquant franc du jalapeño, adouci par un zeste de citron vert. Fraîcheur et feu dans le même sachet.",
    details: ["Piment jalapeño", "Zeste de citron vert", "Vegan"],
    rating: 4.5,
    stock: 32,
    isNew: true,
  },
  {
    slug: "barbecue",
    name: "Barbecue fumé",
    short: "BARBECUE",
    category: "relevees",
    price: 279,
    weight: 150,
    spice: 1,
    color: "#D9542B",
    emoji: "🔥",
    description: "Sucrée, fumée, un brin épicée : toute l'ambiance d'un barbecue d'été, sans allumer le feu.",
    details: ["Assaisonnement fumé au hêtre", "Pointe de sucre de canne", "Sans gluten"],
    rating: 4.6,
    stock: 47,
  },
  {
    slug: "habanero-extreme",
    name: "Habanero extrême",
    short: "HABANERO",
    category: "relevees",
    price: 349,
    weight: 100,
    spice: 3,
    color: "#E8343D",
    emoji: "💀",
    description: "Réservée aux plus courageux. Le habanero frappe fort, et longtemps. Un verre de lait à portée de main est conseillé.",
    details: ["Piment habanero", "Très très piquant", "Déconseillé aux enfants"],
    rating: 4.3,
    stock: 6,
    featured: true,
  },
  {
    slug: "truffe-noire",
    name: "Truffe noire",
    short: "TRUFFE",
    category: "gourmandes",
    price: 429,
    compareAtPrice: 499,
    weight: 100,
    spice: 0,
    color: "#8E7BFF",
    emoji: "🍄",
    description: "Des chips fines relevées d'huile à la truffe noire du Périgord. Le petit luxe de l'apéro.",
    details: ["Truffe noire du Périgord", "Huile d'olive", "Édition apéro chic"],
    rating: 4.9,
    stock: 18,
    featured: true,
  },
  {
    slug: "creme-oignon",
    name: "Crème & oignon",
    short: "CRÈME OIGNON",
    category: "gourmandes",
    price: 269,
    weight: 150,
    spice: 0,
    color: "#5CB8FF",
    emoji: "🧅",
    description: "Une crème aigre onctueuse et des oignons doux ciboulette. Le goût qui fait l'unanimité.",
    details: ["Crème aigre & ciboulette", "Oignons doux", "Végétarien"],
    rating: 4.7,
    stock: 50,
  },
  {
    slug: "miel-moutarde",
    name: "Miel moutarde",
    short: "MIEL MOUTARDE",
    category: "gourmandes",
    price: 289,
    weight: 150,
    spice: 0,
    color: "#F5A700",
    emoji: "🍯",
    description: "La douceur du miel de fleurs, le peps de la moutarde de Dijon. Un duo sucré-salé irrésistible.",
    details: ["Miel de fleurs français", "Moutarde de Dijon", "Végétarien"],
    rating: 4.5,
    stock: 28,
    isNew: true,
  },
  {
    slug: "poulet-roti",
    name: "Poulet rôti",
    short: "POULET RÔTI",
    category: "gourmandes",
    price: 279,
    weight: 150,
    spice: 0,
    color: "#E0A458",
    emoji: "🍗",
    description: "Le goût du poulet du dimanche, thym et romarin compris. Victime de son succès, de retour très vite.",
    details: ["Herbes de Provence", "Arôme naturel", "Sans huile de palme"],
    rating: 4.2,
    stock: 0,
  },
  {
    slug: "patate-douce",
    name: "Patate douce",
    short: "PATATE DOUCE",
    category: "legeres",
    price: 319,
    weight: 100,
    spice: 0,
    color: "#FF7A59",
    emoji: "🍠",
    description: "Des tranches de patate douce cuites au four : naturellement sucrées, 40 % de matières grasses en moins.",
    details: ["Cuites au four", "−40 % de matières grasses", "Sans gluten"],
    rating: 4.4,
    stock: 36,
  },
  {
    slug: "legumes-racines",
    name: "Légumes racines",
    short: "LÉGUMES",
    category: "legeres",
    price: 339,
    weight: 100,
    spice: 0,
    color: "#E0457B",
    emoji: "🥕",
    description: "Betterave, panais et carotte : un mélange coloré et croquant qui fait du bien.",
    details: ["Betterave, panais, carotte", "Cuites au four", "Vegan"],
    rating: 4.3,
    stock: 24,
  },
  {
    slug: "lentilles-corail",
    name: "Chips de lentilles",
    short: "LENTILLES",
    category: "legeres",
    price: 299,
    weight: 85,
    spice: 0,
    color: "#FF9EBB",
    emoji: "🫘",
    description: "Soufflées à base de lentilles corail : légères comme l'air, riches en protéines.",
    details: ["Riche en protéines", "Soufflées, non frites", "Sans gluten"],
    rating: 4.5,
    stock: 30,
    isNew: true,
  },
  {
    slug: "box-decouverte",
    name: "Box découverte",
    short: "DÉCOUVERTE",
    category: "packs",
    price: 1390,
    compareAtPrice: 1594,
    weight: 900,
    spice: 1,
    color: "#FF5C8A",
    emoji: "🎁",
    description: "Six saveurs pour faire le tour de la maison : sel de mer, paprika, crème & oignon, barbecue, vinaigre et truffe.",
    details: ["6 sachets de 150 g", "Une saveur de chaque univers", "Idéale à offrir"],
    rating: 4.9,
    stock: 20,
  },
  {
    slug: "pack-soiree",
    name: "Pack soirée XXL",
    short: "SOIRÉE XXL",
    category: "packs",
    price: 2490,
    compareAtPrice: 2990,
    weight: 1800,
    spice: 2,
    color: "#3D7BFF",
    emoji: "🎉",
    description: "Douze sachets pour tenir toute la soirée, des plus douces aux plus piquantes. Les invités repartent contents.",
    details: ["12 sachets de 150 g", "Mélange doux & relevé", "Livré dans une boîte cadeau"],
    rating: 4.8,
    stock: 12,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatPrice(cents: number) {
  return priceFormatter.format(cents / 100);
}

export function pricePerKg(product: Product) {
  return formatPrice(Math.round((product.price / product.weight) * 1000));
}

export function formatWeight(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString("fr-FR")} kg` : `${grams} g`;
}

export const SPICE_LABELS = ["Douce", "Relevée", "Piquante", "Extrême"] as const;

export const FREE_SHIPPING_THRESHOLD = 3500;
export const SHIPPING_OPTIONS = [
  { id: "standard", label: "Livraison standard (2–4 jours)", price: 490 },
  { id: "express", label: "Livraison express (24 h)", price: 890 },
] as const;
export type ShippingId = (typeof SHIPPING_OPTIONS)[number]["id"];
