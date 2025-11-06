import express from "express";
import {
  addToCart,
  getUserCart,
  deleteCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua route di-protect JWT
router.post("/", verifyToken, addToCart);
router.get("/", verifyToken, getUserCart);
router.delete("/:id", verifyToken, deleteCartItem);
router.delete("/", verifyToken, clearCart);

export default router;
