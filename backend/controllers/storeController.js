import Store from "../models/storeModel.js";
import User from "../models/userModel.js";

export const createStore = async (req, res) => {
  try {
    const userId = req.user.id; // ambil dari JWT middleware
    const { name, description } = req.body;

    // Cek apakah user sudah punya store
    const existingStore = await Store.findOne({ where: { user_id: userId } });
    if (existingStore) {
      return res.status(400).json({ message: "User sudah memiliki store" });
    }

    // Buat store baru
    const store = await Store.create({
      name,
      description,
      user_id: userId,
      status: "active",
    });

    // Update flag user.has_store
    await User.update({ has_store: true }, { where: { id: userId } });

    res.status(201).json({
      message: "Store berhasil dibuat",
      store,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin: update status toko user
export const updateStoreStatus = async (req, res) => {
  try {
    const storeId = req.params.id;
    const { status } = req.body; // active / inactive

    const store = await Store.findByPk(storeId, {
      include: { model: User, as: "user", attributes: ["id", "username"] },
    });

    if (!store)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    store.status = status;
    await store.save();

    res.status(200).json({
      message: "Status toko berhasil diperbarui",
      store,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ User: update data store miliknya sendiri
export const updateMyStore = async (req, res) => {
  try {
    const userId = req.user.id; // dari token JWT
    const { name, description } = req.body;

    // Cari store berdasarkan userId
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store) {
      return res.status(404).json({ message: "Kamu belum memiliki store" });
    }

    // Update field yang dikirim
    store.name = name ?? store.name;
    store.description = description ?? store.description;

    await store.save();

    res.status(200).json({
      message: "Store berhasil diperbarui",
      store,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
