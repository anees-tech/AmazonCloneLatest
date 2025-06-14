const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, required: true }, // change 2
    featured: { type: Boolean, default: false },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    options: { type: Object, default: {} },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Product", ProductSchema)
