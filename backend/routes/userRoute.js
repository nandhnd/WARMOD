import express from "express";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Admin & User
router.get("/:id", verifyToken, getUserById);

// Admin
router.get("/", verifyToken, isAdmin, getAllUsers);

// User
router.put("/:id", verifyToken, updateProfile);

export default router;
