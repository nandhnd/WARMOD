import express from "express";
import {
  getAllUsers,
  getUserById,
  updateMyUsername,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin - User Management
 *   description: Manajemen pengguna oleh admin
 */

router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.put("/me/username", verifyToken, updateMyUsername);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
