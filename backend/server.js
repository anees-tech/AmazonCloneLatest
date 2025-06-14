const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")

dotenv.config()

const app = express()

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
}

app.use(express.json())
app.use(cors(corsOptions))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))

app.use("/api/auth", require("./routes/userRoutes"))
app.use("/api/admin", require("./routes/adminRoutes"))
app.use("/api", require("./routes/productRoutes"))
app.use("/api/orders", require("./routes/orderRoutes")) // Add this line
// Seed initial data


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
