// Initial seed data for categories and products

const categories = [
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
  
  const products = [
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
      rating: 4.5,
      reviews: 120,
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
      rating: 4.2,
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
  ]
  
  module.exports = { categories, products }
  