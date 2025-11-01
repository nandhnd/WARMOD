import express from "express";
import {
  createAddon,
  getMyAddons,
  updateMyAddon,
  deleteMyAddon,
  getAllAddons,
  verifyAddon,
  getApprovedAddons,
} from "../controllers/addonController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// publik
router.get("/public", getApprovedAddons);

// user
router.post("/", verifyToken, createAddon);
router.get("/me", verifyToken, getMyAddons);
router.put("/me/:id", verifyToken, updateMyAddon);
router.delete("/me/:id", verifyToken, deleteMyAddon);

// admin
router.get("/", verifyToken, isAdmin, getAllAddons);
router.put("/:id/verify", verifyToken, isAdmin, verifyAddon);

export default router;
