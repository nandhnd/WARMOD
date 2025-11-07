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
router.get("/addons/public", getApprovedAddons);

// User & Admin
router.get("/addons/:id", getAddonById);

// User
router.post("/addons", verifyToken, createAddon);
router.get("/addons/me", verifyToken, getMyAddons);
router.put("/addons/me/:id", verifyToken, updateMyAddon);
router.delete("/addons/me/:id", verifyToken, deleteMyAddon);

// Admin
router.get("/addons", verifyToken, isAdmin, getAllAddons);
router.put("/addons/:id/verify", verifyToken, isAdmin, verifyAddon);

export default router;
