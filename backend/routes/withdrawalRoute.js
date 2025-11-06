import express from "express";
import {
  createWithdrawalRequest,
  getAllWithdrawals,
  updateWithdrawalStatus,
} from "../controllers/withdrawalController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Penjual ajukan penarikan
router.post("/", verifyToken, createWithdrawalRequest);

// Admin lihat semua pengajuan
router.get("/", verifyToken, isAdmin, getAllWithdrawals);

// Admin ubah status
router.put("/:id", verifyToken, isAdmin, updateWithdrawalStatus);

export default router;
