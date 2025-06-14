export const products = [
  {
    id: 1,
    name: "Vintage Denim Jacket",
    price: 89.99,
    description:
      "Classic vintage denim jacket with a modern twist. Features distressed details and a comfortable fit that goes with any outfit.",
    category: "clothing",
    featured: true,

    images: [
      "/image/featured/jacet.jfif",
      "/images/products/denim-jacket-2.jpg",
      "/images/products/denim-jacket-3.jpg",
    ],
  
  },
    {
    id: 111,
    name: "bag",
    price: 89.99,
    description:
      "Classic vintage denim jacket with a modern twist. Features distressed details and a comfortable fit that goes with any outfit.",
    category: "clothing",
    featured: true,

    images: [
      "/image/featured/bag.jfif",
      "/images/products/denim-jacket-2.jpg",
      "/images/products/denim-jacket-3.jpg",
    ],
    rating: 3,
    reviews: 89,
  
  },
  
  {
    id: 131,
    name: "running shoes",
    price: 89.99,
    description:
      "Classic vintage denim jacket with a modern twist. Features distressed details and a comfortable fit that goes with any outfit.",
    category: "clothing",
    featured: true,

    images: [
      "/image/featured/shoes.jfif",
      "/images/products/denim-jacket-2.jpg",
      "/images/products/denim-jacket-3.jpg",
      
    ],
    rating: 2,
    reviews: 89,
  
  },
  {
    id: 2,
    name: "Leather Crossbody Bag",
    price: 129.99,
    description:
      "Handcrafted leather crossbody bag with adjustable strap and multiple compartments for organization. Perfect for everyday use.",
    category: "accessories",
    featured: true,
    images: ["/image/featured/bag.jfif"],
    options: {
      colors: ["Black", "Brown", "Tan"],
    },
    rating: 2,
    reviews: 89,
  },
  {
    id: 3,
    name: "Wireless Bluetooth Headphones",
    price: 199.99,
    description:
      "Premium wireless headphones with noise cancellation technology, 30-hour battery life, and comfortable over-ear design.",
    category: "electronics",
    featured: true,
    images: ["/image/featured/headphone.jfif"],
    options: {
      colors: ["Black", "White", "Silver"],
    },
    rating: 4.9,
    reviews: 203,
  },
  {
    id: 4,
    name: "Minimalist Watch",
    price: 149.99,
    description:
      "Elegant minimalist watch with a stainless steel case, genuine leather strap, and Japanese quartz movement.",
    category: "accessories",
    featured: false,
    images: ["/image/featured/minlistwatch.jfif"],
    options: {
      colors: ["Black/Silver", "Brown/Gold", "Blue/Silver"],
    },
    rating: 4.6,
    reviews: 78,
  },
  {
    id: 5,
    name: "Cotton T-Shirt",
    price: 24.99,
    description:
      "Soft, breathable cotton t-shirt with a relaxed fit. A wardrobe essential available in multiple colors.",
    category: "clothing",
    featured: false,
    images: ["/image/featured/shirt.jfif"],
    options: {
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["White", "Black", "Gray", "Navy", "Red"],
    },
    rating: 4.5,
    reviews: 156,
  },
  {
    id: 6,
    name: "Smart Fitness Tracker",
    price: 79.99,
    description:
      "Advanced fitness tracker with heart rate monitoring, sleep tracking, and smartphone notifications. Water-resistant design.",
    category: "electronics",
    featured: false,
    images: ["/image/featured/fitness.jfif"],
    options: {
      colors: ["Black", "Blue", "Pink"],
    },
    rating: 4.4,
    reviews: 112,
  },
  {
    id: 7,
    name: "Ceramic Coffee Mug",
    price: 19.99,
    description:
      "Handmade ceramic coffee mug with a comfortable handle and 12oz capacity. Microwave and dishwasher safe.",
    category: "home",
    featured: false,
    images: ["/image/featured/mug.jfif"],
    options: {
      colors: ["White", "Black", "Blue", "Green"],
    },
    rating: 4.3,
    reviews: 67,
  },
  {
    id: 8,
    name: "Wool Blend Sweater",
    price: 69.99,
    description: "Cozy wool blend sweater with ribbed cuffs and hem. Perfect for layering in colder weather.",
    category: "clothing",
    featured: false,
    images: ["/image/featured/wool.jfif"],
    options: {
      sizes: ["S", "M", "L", "XL"],
      colors: ["Cream", "Gray", "Navy", "Burgundy"],
    },
    rating: 4.7,
    reviews: 94,
  },
  {
    id: 9,
    name: "Portable Bluetooth Speaker",
    price: 59.99,
    description:
      "Compact Bluetooth speaker with powerful sound, 10-hour battery life, and water-resistant design. Perfect for outdoor activities.",
    category: "electronics",
    featured: false,
    images: ["/image/featured/spea.jfif"],
    options: {
      colors: ["Black", "Blue", "Red"],
    },
    rating: 4.5,
    reviews: 132,
  },
  {
    id: 10,
    name: "Leather Wallet",
    price: 49.99,
    description: "Genuine leather wallet with multiple card slots, bill compartment, and RFID blocking technology.",
    category: "accessories",
    featured: false,
    images: ["/image/featured/wallet.jfif"],
    options: {
      colors: ["Black", "Brown", "Tan"],
    },
    rating: 4.6,
    reviews: 85,
  },
  {
    id: 11,
    name: "Scented Candle Set",
    price: 34.99,
    description:
      "Set of three scented soy candles in decorative glass jars. Long-lasting and perfect for creating a cozy atmosphere.",
    category: "home",
    featured: false,
    images: ["/image/featured/candle.jfif"],
    options: {
      scents: ["Vanilla", "Lavender", "Sandalwood"],
    },
    rating: 3,
    reviews: 73,
  },
  
]

export const categories = [
  {
    id: "clothing",
    name: "Clothing",
    image: "/images/categories/clothing.jpg",
  },
  
  {
    id: "accessories",
    name: "Accessories",
    image: "/images/categories/accessories.jpg",
  },
  {
    id: "electronics",
    name: "Electronics",
    image: "/images/categories/electronics.jpg",
  },
  {
    id: "home",
    name: "Home & Living",
    image: "/images/categories/home.jpg",
  },
  {
    id: "footwear",
    name: "Footwear",
    image: "/images/categories/footwear.jpg",
  },
]

export const carouselData = [ // banners
  {
    id: 1,
    title: "Summer Collection",
    subtitle: "50% Off Selected Items",
    image: "public/image/Banners/b2.jpg",
    link: "/products?category=clothing",
  },
  {
    id: 2,
    title: "New Electronics",
    subtitle: "Latest Gadgets & Accessories",
    image: "/image/Banners/b3.jpg",
    link: "/products?category=electronics",
  },
  {
    id: 3,
    title: "Home Essentials",
    subtitle: "Create Your Perfect Space",
    image: "/image/banners/homeessential.jfif",
    link: "/products?category=home",
  },
  
]

