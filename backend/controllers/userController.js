import User from "../models/userModel.js";
import Store from "../models/storeModel.js";

// ✅ Lihat semua user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "username", "role", "has_store", "createdAt"],
      include: [
        { model: Store, as: "store", attributes: ["id", "name", "status"] },
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lihat user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "email", "username", "role", "has_store"],
      include: [
        { model: Store, as: "store", attributes: ["id", "name", "status"] },
      ],
    });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ User ubah username miliknya sendiri
export const updateMyUsername = async (req, res) => {
  try {
    const userId = req.user.id; // dari token JWT
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username tidak boleh kosong" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.username = username;
    await user.save();

    res.status(200).json({
      message: "Username berhasil diperbarui",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        has_store: user.has_store,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ (Opsional) Hapus user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await user.destroy();
    res.status(200).json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
