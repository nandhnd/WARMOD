import User from "../models/userModel.js";
import Store from "../models/storeModel.js";

// Admin: Lihat semua user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "username", "role", "has_store", "createdAt"],
      include: [
        { model: Store, as: "store", attributes: ["id", "name", "status"] },
      ],
    });
    res.status(200).json({
      status: "success",
      message: "Data users ditemukan",
      data: {
        users,
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

// Admin & User: Lihat user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "email", "username", "role", "has_store", "createdAt"],
      include: [
        { model: Store, as: "store", attributes: ["id", "name", "status"] },
      ],
    });

    if (!user)
      return res.status(404).json({
        status: "fail",
        message: "User tidak ditemukan",
      });

    return res.status(200).json({
      status: "success",
      message: "Data user ditemukan",
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

// User : Update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: "fail",
        message: "Username tidak boleh kosong",
      });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "Anda tidak memiliki izin untuk mengubah data ini",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User tidak ditemukan",
      });
    }

    user.username = username;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        has_store: user.has_store,
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
