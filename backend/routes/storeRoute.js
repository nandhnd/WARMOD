import express from "express";
import {
  getStore,
  createStore,
  updateStoreStatus,
  updateStore,
} from "../controllers/storeController.js";
import {
  getSellerBalance,
  getSellerBalanceHistory,
} from "../controllers/sellerBalanceController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin & User
router.get("/:store_id", verifyToken, getStore);
router.get("/:store_id/balance", verifyToken, getSellerBalance);
router.get("/:store_id/balance/history", verifyToken, getSellerBalanceHistory);

// Admin
router.put("/:id/status", verifyToken, isAdmin, updateStoreStatus);

// User
router.post("/", verifyToken, createStore);
router.put("/:store_id", verifyToken, updateStore);

export default router;
