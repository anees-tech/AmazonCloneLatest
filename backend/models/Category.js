const mongoose = require("mongoose")

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, default: "/images/categories/default.jpg" },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Category", CategorySchema)
