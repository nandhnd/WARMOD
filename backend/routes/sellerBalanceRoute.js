import express from "express";
import {
  getSellerBalance,
  getSellerBalanceHistory,
  withdrawSellerBalance,
} from "../controllers/sellerBalanceController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET total saldo toko
router.get("/:store_id", verifyToken, getSellerBalance);

// GET riwayat saldo toko
router.get("/:store_id/history", verifyToken, getSellerBalanceHistory);

export default router;
