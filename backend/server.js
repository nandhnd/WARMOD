import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import syncDatabase from "./models/index.js";

import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import storeRoute from "./routes/storeRoute.js";
import addonRoute from "./routes/addonRoute.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("🚀 Addons Marketplace API is running...");
});
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/stores", storeRoute);
app.use("/api/addons", addonRoute);

// Tes koneksi database
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected...");
    syncDatabase();
  })
  .catch((err) => console.error("❌ Database connection failed:", err));

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
