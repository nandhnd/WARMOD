import express from "express";
import {
  createAddon,
  getMyAddons,
  updateMyAddon,
  deleteMyAddon,
  getPendingAddons,
  verifyAddon,
  getApprovedAddons,
  getAddonById,
} from "../controllers/addonController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Publik
router.get("/public", getApprovedAddons);

// User & Admin
router.get("/:id", verifyToken, getAddonById);

// User
router.post("/", verifyToken, upload.array("images", 5), createAddon);
router.get("/me", verifyToken, getMyAddons);
router.put("/me/:id", verifyToken, updateMyAddon);
router.delete("/me/:id", verifyToken, deleteMyAddon);

// Admin
router.get("/", verifyToken, isAdmin, getPendingAddons);
router.put("/:id/verify", verifyToken, isAdmin, verifyAddon);

export default router;
