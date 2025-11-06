import express from "express";
import {
  instantCheckout,
  cartCheckout,
  midtransWebhook,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout/instant", verifyToken, instantCheckout);
router.post("/checkout/cart", verifyToken, cartCheckout);
router.post("/webhook/midtrans", midtransWebhook);

export default router;
