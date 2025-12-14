import express from "express";
import {
  getStore,
  getStoreById,
  createStore,
  updateStoreStatus,
  updateStore,
  getStoreAddons,
} from "../controllers/storeController.js";
import {
  getSellerBalance,
  getSellerBalanceHistory,
} from "../controllers/sellerBalanceController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin & User
// router.get("/:store_id", verifyToken, getStoreById);
router.get("/:store_id/balance", verifyToken, getSellerBalance);
router.get("/:store_id/balance/history", verifyToken, getSellerBalanceHistory);

// Admin
router.put("/:id/status", verifyToken, isAdmin, updateStoreStatus);

// User
router.get("/", verifyToken, getStore);
router.get("/addons", verifyToken, getStoreAddons);
router.post("/", verifyToken, createStore);
router.put("/", verifyToken, updateStore);

export default router;
