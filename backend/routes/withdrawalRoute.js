import express from "express";
import {
  createWithdrawalRequest,
  getAllWithdrawals,
  updateWithdrawalStatus,
  getOngoingWithdrawal,
} from "../controllers/withdrawalController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User:
router.post("/", verifyToken, createWithdrawalRequest);
router.get("/ongoing", verifyToken, getOngoingWithdrawal);

// Admin
router.get("/", verifyToken, isAdmin, getAllWithdrawals);
router.put("/:id", verifyToken, isAdmin, updateWithdrawalStatus);

export default router;
