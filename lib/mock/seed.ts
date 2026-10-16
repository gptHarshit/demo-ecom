// ---------------------------------------------------------------------------
// DEMO CATALOG
//
// Every product, variant, option and stock figure in this file is invented
// for demonstration purposes. None of it comes from a real store. Each new
// workspace (the built-in demo account and every account created through
// /sign-up) gets its own copy of this catalog, which it can then edit freely.
// ---------------------------------------------------------------------------

export interface SeedVariant {
  options: Record<string, string>; // e.g. { Size: "M", Color: "Black" }
  qty: number;
  reserved?: number;
  price?: number; // defaults to the product price
  cost?: number;
  weight?: string;
}

export interface SeedProduct {
  name: string;
  description: string;
  sku: string;
  price: number;
  cost?: number;
  status: "active" | "draft" | "archived";
  daysAgo: number; // when the product was "created"
  qty?: number; // simple products only
  reserved?: number;
  weight?: string;
  variants?: SeedVariant[];
}

export const SEED_OPTION_TYPES: Record<string, string[]> = {
  Size: ["XS", "S", "M", "L", "XL", "XXL"],
  Color: ["Black", "White", "Navy", "Olive", "Grey", "Beige", "Maroon"],
  Material: ["Cotton", "Linen", "Denim", "Polyester"],
  Fit: ["Slim", "Regular", "Relaxed"],
};

// Small helper for building size/colour matrices with varied stock levels.
function matrix(
  sizes: string[],
  colors: string[],
  stock: number[],
  extra: Partial<SeedVariant> = {},
): SeedVariant[] {
  const out: SeedVariant[] = [];
  let i = 0;
  for (const color of colors) {
    for (const size of sizes) {
      const qty = stock[i % stock.length];
      out.push({
        options: { Size: size, Color: color },
        qty,
        reserved: qty > 6 && i % 3 === 0 ? 2 : 0,
        ...extra,
      });
      i++;
    }
  }
  return out;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "Essential Crew Neck T-Shirt",
    description:
      "Everyday 180 GSM combed-cotton tee with a soft hand-feel and ribbed collar. Pre-shrunk and bio-washed.",
    sku: "UT-TEE-ESS",
    price: 699,
    cost: 240,
    status: "active",
    daysAgo: 84,
    variants: matrix(["S", "M", "L", "XL"], ["Black", "White", "Navy"], [42, 58, 36, 14, 4, 27, 33, 0, 19, 22, 9, 31], {
      weight: "0.18",
    }),
  },
  {
    name: "Oversized Graphic Tee",
    description:
      "Drop-shoulder oversized tee in heavyweight 220 GSM cotton with a screen-printed back graphic.",
    sku: "UT-TEE-OVR",
    price: 899,
    cost: 310,
    status: "active",
    daysAgo: 71,
    variants: matrix(["M", "L", "XL"], ["Black", "Beige"], [26, 18, 7, 12, 3, 0], { weight: "0.24" }),
  },
  {
    name: "Classic Pique Polo",
    description:
      "Two-button pique polo with a flat-knit collar and side vents. Breathable cotton-blend fabric.",
    sku: "UT-POLO-CLS",
    price: 1099,
    cost: 420,
    status: "active",
    daysAgo: 66,
    variants: matrix(["S", "M", "L", "XL"], ["Navy", "Olive"], [11, 24, 20, 6, 15, 8, 2, 13], { weight: "0.26" }),
  },
  {
    name: "Slim Fit Stretch Jeans",
    description:
      "Mid-rise slim jeans in 98% cotton / 2% elastane denim with a clean indigo wash.",
    sku: "UT-JNS-SLM",
    price: 1799,
    cost: 690,
    status: "active",
    daysAgo: 62,
    variants: [
      { options: { Size: "S", Fit: "Slim" }, qty: 14, reserved: 1 },
      { options: { Size: "M", Fit: "Slim" }, qty: 22, reserved: 3 },
      { options: { Size: "L", Fit: "Slim" }, qty: 17 },
      { options: { Size: "XL", Fit: "Slim" }, qty: 5 },
    ],
  },
  {
    name: "Relaxed Cargo Pants",
    description:
      "Utility cargo trousers with six pockets, an adjustable drawcord hem and a relaxed tapered leg.",
    sku: "UT-PNT-CRG",
    price: 1899,
    cost: 720,
    status: "active",
    daysAgo: 58,
    variants: [
      { options: { Size: "M", Color: "Olive" }, qty: 3 },
      { options: { Size: "L", Color: "Olive" }, qty: 2, reserved: 1 },
      { options: { Size: "M", Color: "Beige" }, qty: 0 },
      { options: { Size: "L", Color: "Beige" }, qty: 1 },
    ],
  },
  {
    name: "Linen Blend Shirt",
    description:
      "Lightweight linen-cotton shirt with a spread collar and coconut-shell buttons. Ideal for summer.",
    sku: "UT-SHT-LIN",
    price: 1499,
    cost: 560,
    status: "active",
    daysAgo: 54,
    variants: [
      { options: { Size: "M", Color: "White", Material: "Linen" }, qty: 18, reserved: 2 },
      { options: { Size: "L", Color: "White", Material: "Linen" }, qty: 12 },
      { options: { Size: "M", Color: "Beige", Material: "Linen" }, qty: 9 },
      { options: { Size: "L", Color: "Beige", Material: "Linen" }, qty: 6 },
    ],
  },
  {
    name: "Fleece Pullover Hoodie",
    description:
      "Brushed-back fleece hoodie with a double-layer hood, kangaroo pocket and ribbed cuffs.",
    sku: "UT-HD-FLC",
    price: 1999,
    cost: 780,
    status: "active",
    daysAgo: 49,
    variants: matrix(["M", "L", "XL"], ["Grey", "Black", "Maroon"], [16, 21, 8, 10, 14, 4, 0, 5, 3], {
      weight: "0.52",
    }),
  },
  {
    name: "Quilted Puffer Jacket",
    description:
      "Water-resistant puffer with recycled polyester fill, a stand collar and two zip pockets.",
    sku: "UT-JKT-PUF",
    price: 3499,
    cost: 1450,
    status: "active",
    daysAgo: 45,
    variants: [
      { options: { Size: "M", Color: "Black" }, qty: 7 },
      { options: { Size: "L", Color: "Black" }, qty: 4, reserved: 1 },
      { options: { Size: "M", Color: "Navy" }, qty: 2 },
      { options: { Size: "L", Color: "Navy" }, qty: 0 },
    ],
  },
  {
    name: "Denim Trucker Jacket",
    description:
      "Classic trucker-style jacket in rigid 13 oz denim with chest flap pockets.",
    sku: "UT-JKT-DNM",
    price: 2799,
    cost: 1100,
    status: "active",
    daysAgo: 41,
    qty: 0,
  },
  {
    name: "Regular Fit Chinos",
    description:
      "Garment-dyed cotton twill chinos with a mid rise, slant pockets and a regular straight leg.",
    sku: "UT-CHN-REG",
    price: 1499,
    cost: 560,
    status: "active",
    daysAgo: 38,
    qty: 8,
    reserved: 1,
    weight: "0.48",
  },
  {
    name: "Everyday Jogger Pants",
    description: "French-terry joggers with an elastic waist, zip pockets and cuffed hems.",
    sku: "UT-JGR-EVD",
    price: 1199,
    cost: 430,
    status: "active",
    daysAgo: 35,
    qty: 64,
    reserved: 6,
  },
  {
    name: "Ribbed Knit Beanie",
    description: "Soft acrylic-wool blend beanie with a fold-over cuff. One size fits most.",
    sku: "UT-ACC-BNE",
    price: 499,
    cost: 140,
    status: "active",
    daysAgo: 33,
    qty: 120,
    reserved: 4,
    weight: "0.08",
  },
  {
    name: "Canvas Tote Bag",
    description: "Heavy 12 oz canvas tote with reinforced handles and an inside zip pocket.",
    sku: "UT-ACC-TOT",
    price: 599,
    cost: 180,
    status: "active",
    daysAgo: 30,
    qty: 85,
  },
  {
    name: "Leather Card Holder",
    description: "Slim full-grain leather card holder with four card slots and a centre pocket.",
    sku: "UT-ACC-CRD",
    price: 899,
    cost: 290,
    status: "active",
    daysAgo: 28,
    qty: 4,
  },
  {
    name: "Crew Socks (Pack of 3)",
    description: "Cushioned cotton-rich crew socks with arch support. Pack of three pairs.",
    sku: "UT-ACC-SCK3",
    price: 449,
    cost: 120,
    status: "active",
    daysAgo: 26,
    qty: 210,
    reserved: 12,
  },
  {
    name: "Baseball Cap",
    description: "Six-panel washed cotton cap with an embroidered logo and adjustable strap.",
    sku: "UT-ACC-CAP",
    price: 649,
    cost: 190,
    status: "active",
    daysAgo: 24,
    qty: 2,
  },
  {
    name: "Merino Crew Sweater",
    description: "Fine-gauge extra-fine merino sweater. Lightweight, warm and naturally odour-resistant.",
    sku: "UT-SWT-MER",
    price: 2999,
    cost: 1200,
    status: "active",
    daysAgo: 21,
    variants: [
      { options: { Size: "M", Color: "Navy" }, qty: 9 },
      { options: { Size: "L", Color: "Navy" }, qty: 11, reserved: 2 },
      { options: { Size: "M", Color: "Grey" }, qty: 6 },
      { options: { Size: "L", Color: "Grey" }, qty: 3 },
    ],
  },
  {
    name: "Athletic Shorts",
    description: "Quick-dry polyester running shorts with a built-in liner and reflective details.",
    sku: "UT-SHR-ATH",
    price: 899,
    cost: 300,
    status: "active",
    daysAgo: 18,
    qty: 47,
    reserved: 3,
  },
  {
    name: "Oxford Button-Down Shirt",
    description: "Washed Oxford cotton shirt with a button-down collar and a single chest pocket.",
    sku: "UT-SHT-OXF",
    price: 1399,
    cost: 520,
    status: "active",
    daysAgo: 15,
    qty: 33,
    reserved: 2,
  },
  {
    name: "Striped Breton Top",
    description: "Long-sleeve boat-neck top in soft jersey with classic navy stripes.",
    sku: "UT-TOP-BRT",
    price: 1099,
    cost: 380,
    status: "active",
    daysAgo: 12,
    qty: 0,
  },
  {
    name: "Packable Rain Jacket",
    description: "Lightweight waterproof shell that packs into its own pocket. Taped seams.",
    sku: "UT-JKT-RAN",
    price: 2499,
    cost: 980,
    status: "draft",
    daysAgo: 9,
    qty: 25,
  },
  {
    name: "Corduroy Overshirt",
    description: "8-wale corduroy overshirt with two chest pockets. Wear it open as a light layer.",
    sku: "UT-SHT-CRD",
    price: 1899,
    cost: 700,
    status: "draft",
    daysAgo: 6,
    qty: 15,
  },
  {
    name: "Thermal Waffle Henley",
    description: "Waffle-knit long-sleeve henley with a three-button placket.",
    sku: "UT-TOP-HNL",
    price: 1199,
    cost: 410,
    status: "active",
    daysAgo: 4,
    qty: 10,
  },
  {
    name: "Wool Blend Scarf",
    description: "Brushed wool-blend scarf with fringed ends. Discontinued colourway.",
    sku: "UT-ACC-SCF",
    price: 799,
    cost: 260,
    status: "archived",
    daysAgo: 95,
    qty: 0,
  },
  {
    name: "Summer Linen Shorts",
    description: "Drawstring linen shorts from last season's collection.",
    sku: "UT-SHR-LIN",
    price: 999,
    cost: 350,
    status: "archived",
    daysAgo: 110,
    qty: 6,
  },
];

// Sign-in details for the ready-made demo workspace.
export const DEMO_ACCOUNT = {
  email: "demo@myleadkart.com",
  password: "Demo@1234",
  name: "Aarav Sharma",
  businessName: "Urban Threads Co.",
};
