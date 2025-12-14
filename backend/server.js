import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "./models/index.js";

import "./cron/discountScheduler.js";

import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import storeRoute from "./routes/storeRoute.js";
import addonRoute from "./routes/addonRoute.js";
import cartRoute from "./routes/cartRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import discountRoute from "./routes/discountRoute.js";
import withdrawal from "./routes/withdrawalRoute.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Addons Marketplace API is running...");
});
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/stores", storeRoute);
app.use("/api/addons", addonRoute);
app.use("/api/cart", cartRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/discounts", discountRoute);
app.use("/api/withdrawals", withdrawal);

// Tes koneksi database
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected...");
    // syncDatabase();
  })
  .catch((err) => console.error("❌ Database connection failed:", err));

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
