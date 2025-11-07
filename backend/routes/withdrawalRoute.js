import express from "express";
import {
  createWithdrawalRequest,
  getAllWithdrawals,
  updateWithdrawalStatus,
} from "../controllers/withdrawalController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User:
router.post("/", verifyToken, createWithdrawalRequest);

// Admin
router.get("/", verifyToken, isAdmin, getAllWithdrawals);
router.put("/:id", verifyToken, isAdmin, updateWithdrawalStatus);

export default router;
