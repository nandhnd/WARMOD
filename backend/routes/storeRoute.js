import express from "express";
import {
  createStore,
  updateStoreStatus,
  updateMyStore,
} from "../controllers/storeController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// user buat toko
router.post("/", verifyToken, createStore);

// user update toko sendiri
router.put("/me", verifyToken, updateMyStore);

// admin ubah status toko
router.put("/:id/status", verifyToken, isAdmin, updateStoreStatus);

export default router;
