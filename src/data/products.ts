import type { Product } from '../types';

/**
 * Curated Clothing Collection - Atelier Permanent Archive
 */
export const PRODUCTS_COLLECTION: Product[] = [
  // Outerwear
  {
    id: 'garment-out-001',
    title: 'Cashmere Double-Breasted Overcoat',
    category: 'Outerwear',
    price: 920,
    stockInventoryCount: 8,
    description:
      'Spun from 100% Grade-A Mongolian cashmere with an unpadded, dropped-shoulder silhouette. Features horn button closures, cupro satin lining, and deep interior ticket pockets.',
    dimensions: 'Relaxed tailored drape, knee length',
    materials: '100% Grade-A Mongolian Cashmere (520 gsm), 100% Bemberg Cupro lining',
    sizes: ['38 / S', '40 / M', '42 / L', '44 / XL'],
    color: 'Oatmeal Melange',
    imageUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-out-002',
    title: '14oz Japanese Selvedge Denim Trucker',
    category: 'Outerwear',
    price: 390,
    stockInventoryCount: 12,
    description:
      'Woven on vintage Toyoda shuttle looms in Kojima, Japan. Unwashed, loomstate indigo denim detailed with solid copper donut buttons and pink selvedge ID line along the front placket.',
    dimensions: 'Standard boxy architectural fit',
    materials: '14oz 100% long-staple cotton, natural vegetable indigo dye',
    sizes: ['S', 'M', 'L', 'XL'],
    color: 'Deep Raw Indigo',
    imageUrl:
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-out-003',
    title: 'Waxed Cotton Minimalist Field Jacket',
    category: 'Outerwear',
    price: 440,
    stockInventoryCount: 4, // LOW STOCK
    description:
      'Weatherproof British dry-waxed cotton canvas. Minimalist standing collar with corduroy lining, concealed two-way matte storm zipper, and magnetic storm flap closure.',
    dimensions: 'Structured military cut with articulated sleeves',
    materials: '100% Scottish dry-waxed cotton (380 gsm), Brisbane Moss corduroy',
    sizes: ['M', 'L', 'XL'],
    color: 'Washed Olive',
    imageUrl:
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80',
  },

  // Knitwear
  {
    id: 'garment-knt-001',
    title: 'Chunky Ribbed Baby Alpaca Cardigan',
    category: 'Knitwear',
    price: 340,
    stockInventoryCount: 15,
    description:
      'Knit in an 5-gauge fisherman rib using Peruvian baby alpaca blended with fine merino. Unmatched thermal retention with an airy, pillowy hand feel and genuine horn buttons.',
    dimensions: 'Slightly oversized cocoon silhouette',
    materials: '70% Royal Baby Alpaca, 30% Extra-fine RWS Merino Wool',
    sizes: ['S', 'M', 'L'],
    color: 'Bone Off-White',
    imageUrl:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-knt-002',
    title: 'Heavy Merino Wool Mock-Neck Sweater',
    category: 'Knitwear',
    price: 280,
    stockInventoryCount: 3, // LOW STOCK
    description:
      'Dense 7-gauge tubular knit with clean raglan sleeve architecture and an ergonomic roll mock collar. Zero scratchiness, naturally odor-resistant and temperature regulating.',
    dimensions: 'Regular tailored cut with snug ribbed hem',
    materials: '100% Non-mulesed Australian Merino Wool (19.5 micron)',
    sizes: ['S', 'M', 'L', 'XL'],
    color: 'Charcoal Slate',
    imageUrl:
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&w=1000&q=80',
  },

  // Tops
  {
    id: 'garment-top-001',
    title: 'Silk-Cotton Relaxed Camp Collar Shirt',
    category: 'Tops',
    price: 220,
    stockInventoryCount: 19,
    description:
      'Woven in Como, Italy from a fluid mulberry silk and long-staple cotton twill. Relaxed cuban collar with French seam construction and mother-of-pearl buttons.',
    dimensions: 'Relaxed casual drape, straight hem with side vents',
    materials: '45% Mulberry Silk, 55% Giza Egyptian Cotton',
    sizes: ['S', 'M', 'L', 'XL'],
    color: 'Chalk Sand',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-top-002',
    title: 'Heavyweight Boxy Supima Cotton Tee',
    category: 'Tops',
    price: 95,
    stockInventoryCount: 42,
    description:
      'Engineered from 280 gsm combed American Supima cotton. Features an authentic high 1.25-inch bound rib collar that will never bacon or stretch out over wash cycles.',
    dimensions: 'Modern boxy drop-shoulder cut',
    materials: '100% California Supima Cotton (280 gsm)',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Washed Black',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-top-003',
    title: 'Loopback French Terry Minimal Hoodie',
    category: 'Tops',
    price: 195,
    stockInventoryCount: 0, // OUT OF STOCK (to showcase Out-of-Stock badge & disabled actions)
    description:
      'Milled in Wakayama on antique loopwheel knitting machines. Clean, stringless double-layered hood with seamless kangaroo pocket and heavy-gauge side rib gussets.',
    dimensions: 'Slightly cropped waist with relaxed chest',
    materials: '100% Organic Ring-spun Cotton French Terry (450 gsm)',
    sizes: ['S', 'M', 'L'],
    color: 'Raw Heather Grey',
    imageUrl:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
  },

  // Bottoms
  {
    id: 'garment-btm-001',
    title: 'Double-Pleated Wide Wool Trousers',
    category: 'Bottoms',
    price: 350,
    stockInventoryCount: 11,
    description:
      'Tailored from 4-season high-twist tropical wool by heritage mill Vitale Barberis Canonico. Deep forward twin pleats, extended tab waistband, and continuous 2-inch cuffs.',
    dimensions: 'High-rise relaxed wide leg with gentle taper',
    materials: '100% Super 110s Virgin Tropical Wool',
    sizes: ['30', '32', '34', '36'],
    color: 'Dark Taupe Melange',
    imageUrl:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-btm-002',
    title: 'Raw Selvedge Straight-Leg Denim',
    category: 'Bottoms',
    price: 260,
    stockInventoryCount: 2, // LOW STOCK
    description:
      'Custom 13.5oz Nihon Menpu red-line selvedge denim. Medium rise with a generous straight leg. Finished with reinforced hidden back pocket rivets and heavy twill pocket bags.',
    dimensions: 'Classic straight leg, 34-inch standard inseam',
    materials: '100% Cotton Selvedge Denim, solid brass hardware',
    sizes: ['30', '32', '34'],
    color: 'Loomstate Raw Indigo',
    imageUrl:
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-btm-003',
    title: 'Belgian Linen Relaxed Drawstring Trouser',
    category: 'Bottoms',
    price: 240,
    stockInventoryCount: 16,
    description:
      'Loomed from certified Master of Linen flax. Pre-shrunk with an elasticated waistband and natural cotton braided drawcord for understated casual refinement.',
    dimensions: 'Relaxed easy fit with clean break hem',
    materials: '100% Belgian Organic Flax Linen (290 gsm)',
    sizes: ['S', 'M', 'L', 'XL'],
    color: 'Natural Oatmeal',
    imageUrl:
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80',
  },

  // Footwear
  {
    id: 'garment-ftw-001',
    title: 'Hand-Burnished Calfskin Chelsea Boots',
    category: 'Footwear',
    price: 480,
    stockInventoryCount: 6,
    description:
      'Handcrafted in Porto using full-grain French calfskin with a Goodyear welted construction. Leather soles with inlaid Vibram rubber toe taps and durable tonal elastic gores.',
    dimensions: 'Chiseled almond toe silhouette',
    materials: 'Full-grain French Box Calf, vegetable-tanned leather sole',
    sizes: ['EU 41 / US 8', 'EU 42 / US 9', 'EU 43 / US 10', 'EU 44 / US 11'],
    color: 'Espresso Brown',
    imageUrl:
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'garment-ftw-002',
    title: 'Minimalist Italian Leather Court Sneaker',
    category: 'Footwear',
    price: 320,
    stockInventoryCount: 14,
    description:
      'Stitched with Margom Italian rubber cup soles and buttery Nappa leather uppers. Calibrated gold-foil serial numbers on the heel and memory foam calfskin insoles.',
    dimensions: 'Low-profile court sneaker',
    materials: 'Italian Nappa leather, calfskin lining, Margom rubber sole',
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
    color: 'Chalk White',
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
  },
];

/**
 * Helper query methods
 */
export function getAllProducts(): Product[] {
  return [...PRODUCTS_COLLECTION];
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS_COLLECTION.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'All') {
    return getAllProducts();
  }
  return PRODUCTS_COLLECTION.filter((product) => product.category === category);
}
