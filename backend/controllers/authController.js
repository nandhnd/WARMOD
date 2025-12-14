import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import Store from "../models/storeModel.js";

dotenv.config();

// Register
export const register = async (req, res) => {
  try {
    const { email, fullname, password } = req.body;
    const username = fullname;

    // Validasi input
    if (!email || !fullname || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Semua field wajib diisi",
      });
    }

    // Cek user sudah ada
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email sudah digunakan",
      });
    }

    // Hash password dan buat user baru
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    return res.status(201).json({
      status: "success",
      message: "Register berhasil",
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email dan password wajib diisi",
      });
    }

    // Cek user
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Store,
          as: "store",
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User tidak ditemukan",
      });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        data: { message: "Password salah" },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: {
        id: user.id,
        fullname: user.username,
        email: user.email,
        tokoStatus: user.has_store,
        store: user.store || null,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};

// Get current user (profile)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: Store,
          as: "store",
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        data: { message: "User tidak ditemukan" },
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Data user ditemukan",
      data: {
        id: user.id,
        fullname: user.username,
        email: user.email,
        tokoStatus: user.has_store,
        store: user.store || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};
