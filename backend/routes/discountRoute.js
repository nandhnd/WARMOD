import express from "express";
import {
  createDiscount,
  getSellerDiscounts,
  updateDiscount,
  AvailableForDiscount,
} from "../controllers/discountController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getSellerDiscounts);
router.post("/", verifyToken, createDiscount);
router.put("/:id", verifyToken, updateDiscount);
router.get("/available", verifyToken, AvailableForDiscount);
// router.delete("/:id", verifyToken, deleteDiscount);

export default router;
