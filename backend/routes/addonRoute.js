import express from "express";
import {
  createAddon,
  getMyAddons,
  updateMyAddon,
  deleteMyAddon,
  getAllAddons,
  verifyAddon,
  getApprovedAddons,
  getAddonById,
} from "../controllers/addonController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Publik
router.get("/public", getApprovedAddons);

// User & Admin
router.get("/:id", getAddonById);

// User
router.post("/", verifyToken, createAddon);
router.get("/me", verifyToken, getMyAddons);
router.put("/me/:id", verifyToken, updateMyAddon);
router.delete("/me/:id", verifyToken, deleteMyAddon);

// Admin
router.get("/", verifyToken, isAdmin, getAllAddons);
router.put("/:id/verify", verifyToken, isAdmin, verifyAddon);

export default router;
