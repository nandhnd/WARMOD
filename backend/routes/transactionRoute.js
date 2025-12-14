import express from "express";
import {
  instantCheckout,
  cartCheckout,
  midtransWebhook,
  getLatestCheckout,
  getTransactionHistory,
  getSellerTransactionsHistory,
  getAdminTransactionsHistory,
} from "../controllers/transactionController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout/instant", verifyToken, instantCheckout);
router.post("/checkout/cart", verifyToken, cartCheckout);
router.post("/webhook/midtrans", midtransWebhook);
router.get("/latest", verifyToken, getLatestCheckout);
router.get("/", verifyToken, getTransactionHistory);
router.get("/seller/history", verifyToken, getSellerTransactionsHistory);
router.get("/admin/history", verifyToken, isAdmin, getAdminTransactionsHistory);

export default router;
