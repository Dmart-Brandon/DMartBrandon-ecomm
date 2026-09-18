export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  images: string[];
  stock: number;
  sku: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  variants: {
    colors?: { name: string; hex: string }[];
    sizes?: string[];
  };
  specs: Record<string, string>;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Fruits',
    slug: 'fruits',
    description: 'Seasonal fruits, harvested at peak ripeness',
    imageUrl:
      'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    name: 'Vegetables',
    slug: 'vegetables',
    description: 'Farm-fresh vegetables, delivered daily',
    imageUrl:
      'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '3',
    name: 'Leafy Greens',
    slug: 'leafy-greens',
    description: 'Crisp greens for salads and sides',
    imageUrl:
      'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '4',
    name: 'Herbs',
    slug: 'herbs',
    description: 'Aromatic herbs picked this morning',
    imageUrl:
      'https://images.pexels.com/photos/1002140/pexels-photo-1002140.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Alphonso Mangoes',
    slug: 'alphonso-mangoes',
    description:
      'The king of mangoes. Sourced from Ratnagiri orchards, these Alphonsos are hand-picked at peak ripeness. Priced per kilogram.',
    price: 499,
    compareAtPrice: 599,
    categoryId: '1',
    images: [
      'https://images.pexels.com/photos/918643/pexels-photo-918643.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    stock: 80,
    sku: 'FRT-MNG-01',
    featured: true,
    newArrival: false,
    bestseller: true,
    variants: {},
    specs: {
      Unit: 'per kg',
      Origin: 'Ratnagiri, Maharashtra',
      Storage: 'Store at room temperature until ripe, then refrigerate',
      Shelf: '4–6 days after delivery',
    },
    rating: 4.9,
    reviewCount: 214,
  },
  {
    id: '2',
    name: 'Baby Spinach',
    slug: 'baby-spinach',
    description:
      'Tender baby spinach leaves, triple-washed and ready to eat. Ideal for salads, smoothies, and light sautés. Sold by the bunch.',
    price: 79,
    categoryId: '3',
    images: [
      'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    stock: 150,
    sku: 'GRN-SPN-01',
    featured: true,
    newArrival: true,
    bestseller: false,
    variants: {},
    specs: {
      Unit: 'per bunch (approx 250g)',
      Origin: 'Local hydroponic farms',
      Storage: 'Refrigerate in a sealed container',
      Shelf: '3–4 days after delivery',
    },
    rating: 4.7,
    reviewCount: 96,
  },
  {
    id: '3',
    name: 'Vine-Ripened Tomatoes',
    slug: 'vine-ripened-tomatoes',
    description:
      'Plump, red vine-ripened tomatoes with balanced acidity and natural sweetness. Perfect for sauces, salads, and sandwiches.',
    price: 59,
    categoryId: '2',
    images: [
      'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    stock: 220,
    sku: 'VEG-TOM-01',
    featured: false,
    newArrival: false,
    bestseller: true,
    variants: {},
    specs: {
      Unit: 'per kg',
      Origin: 'Nashik farms',
      Storage: 'Room temperature until fully ripe',
      Shelf: '5–7 days after delivery',
    },
    rating: 4.5,
    reviewCount: 138,
  },
  {
    id: '4',
    name: 'Cavendish Bananas',
    slug: 'cavendish-bananas',
    description:
      'Golden-yellow Cavendish bananas with a creamy texture and classic sweetness. Great for breakfast bowls and baking.',
    price: 49,
    categoryId: '1',
    images: [
      'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    stock: 300,
    sku: 'FRT-BAN-01',
    featured: true,
    newArrival: false,
    bestseller: true,
    variants: {},
    specs: {
      Unit: 'per dozen',
      Origin: 'Theni, Tamil Nadu',
      Storage: 'Room temperature, hang if possible',
      Shelf: '4–6 days after delivery',
    },
    rating: 4.6,
    reviewCount: 172,
  },
  {
    id: '5',
    name: 'Red Onions',
    slug: 'red-onions',
    description:
      'Firm, sharp red onions with a vibrant purple skin. A pantry staple for curries, salads, and stir-fries.',
    price: 39,
    categoryId: '2',
    images: [
      'https://images.pexels.com/photos/1435903/pexels-photo-1435903.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    stock: 400,
    sku: 'VEG-ONI-01',
    featured: false,
    newArrival: false,
    bestseller: false,
    variants: {},
    specs: {
      Unit: 'per kg',
      Origin: 'Lasalgaon, Maharashtra',
      Storage: 'Cool, dry, well-ventilated place',
      Shelf: '3–4 weeks',
    },
    rating: 4.4,
    reviewCount: 58,
  },
  {
    id: '6',
    name: 'Rainbow Carrots',
    slug: 'rainbow-carrots',
    description:
      'A colourful mix of orange, purple, and yellow carrots. Crisp, sweet, and full of beta-carotene — perfect roasted or raw.',
    price: 69,
    compareAtPrice: 89,
    categoryId: '2',
    images: [
      'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    stock: 120,
    sku: 'VEG-CAR-01',
    featured: true,
    newArrival: true,
    bestseller: false,
    variants: {},
    specs: {
      Unit: 'per kg',
      Origin: 'Ooty farms',
      Storage: 'Refrigerate in a breathable bag',
      Shelf: '1–2 weeks',
    },
    rating: 4.8,
    reviewCount: 81,
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@example.com',
    rating: 5,
    title: 'Tastes like summer',
    comment:
      'These Alphonsos are exactly how I remember them growing up. Perfectly ripe on arrival, zero bruising. Already re-ordered twice this month.',
    verifiedPurchase: true,
    helpfulCount: 45,
    createdAt: '2025-09-15T10:30:00Z',
  },
  {
    id: '2',
    productId: '4',
    userName: 'Michael Chen',
    userEmail: 'mchen@example.com',
    rating: 4,
    title: 'Great for the weekly smoothie run',
    comment:
      'Consistently fresh bananas at a reasonable price. Sometimes arrives a touch greener than I like, but they ripen quickly on the counter.',
    verifiedPurchase: true,
    helpfulCount: 23,
    createdAt: '2025-09-10T14:20:00Z',
  },
  {
    id: '3',
    productId: '6',
    userName: 'Emma Rodriguez',
    userEmail: 'emma.r@example.com',
    rating: 5,
    title: 'Stunning colours, even better flavour',
    comment:
      'The rainbow carrots make every sheet-pan dinner look gorgeous. Crunchy, sweet, and they keep for nearly two weeks in the fridge.',
    verifiedPurchase: true,
    helpfulCount: 67,
    createdAt: '2025-09-20T09:15:00Z',
  },
];
