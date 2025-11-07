import Addon from "../models/addonModel.js";
import Store from "../models/storeModel.js";
import User from "../models/userModel.js";

// User: buat addon baru
export const createAddon = async (req, res) => {
  try {
    const userId = req.user.id;

    // cari store user
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store)
      return res.status(403).json({
        status: "fail",
        data: { message: "User belum memiliki store" },
      });

    const { title, description, price, link, game } = req.body;

    const addon = await Addon.create({
      title,
      description,
      price,
      link,
      game,
      store_id: store.id,
    });

    res.status(201).json({
      status: "success",
      data: {
        message: "Addon berhasil diunggah, menunggu verifikasi admin",
        addon,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: lihat semua addon miliknya
export const getMyAddons = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    const addons = await Addon.findAll({ where: { store_id: store.id } });
    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: update addon miliknya
export const updateMyAddon = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    const { id } = req.params;
    const addon = await Addon.findOne({ where: { id, store_id: store.id } });
    if (!addon)
      return res.status(404).json({ message: "Addon tidak ditemukan" });

    const { title, description, price, link, game } = req.body;

    Object.assign(addon, {
      title: title ?? addon.title,
      description: description ?? addon.description,
      price: price ?? addon.price,
      link: link ?? addon.link,
      game: game ?? addon.game,
    });

    await addon.save();
    res.status(200).json({ message: "Addon berhasil diperbarui", addon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: hapus addon miliknya
export const deleteMyAddon = async (req, res) => {
  try {
    const userId = req.user.id;
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store)
      return res.status(404).json({ message: "Store tidak ditemukan" });

    const { id } = req.params;
    const addon = await Addon.findOne({ where: { id, store_id: store.id } });
    if (!addon)
      return res.status(404).json({ message: "Addon tidak ditemukan" });

    await addon.destroy();
    res.status(200).json({ message: "Addon berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: lihat semua addon
export const getAllAddons = async (req, res) => {
  try {
    const addons = await Addon.findAll({
      include: {
        model: Store,
        as: "store",
        include: { model: User, as: "user" },
      },
    });
    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: verifikasi addon
export const verifyAddon = async (req, res) => {
  try {
    const { status } = req.body; // approved / rejected
    const addon = await Addon.findByPk(req.params.id);
    if (!addon)
      return res.status(404).json({ message: "Addon tidak ditemukan" });

    addon.status = status;
    await addon.save();

    res.status(200).json({
      message: `Addon telah ${status === "approved" ? "disetujui" : "ditolak"}`,
      addon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publik: lihat semua addon yang sudah disetujui
export const getApprovedAddons = async (req, res) => {
  try {
    const addons = await Addon.findAll({
      where: { status: "approved" },
      include: { model: Store, as: "store", attributes: ["id", "name"] },
    });
    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publik: lihat addon berdasarkan id
export const getAddonById = async (req, res) => {
  try {
    const addon = await Addon.findByPk(req.params.id);

    if (!addon) {
      return res.status(404).json({
        status: "fail",
        message: "Addon tidak ditemukan",
      });
    }

    // Jika addon belum diverifikasi, hanya pemilik atau admin yang boleh lihat
    if (addon.status !== "approved") {
      if (
        !req.user ||
        (req.user.role !== "admin" && req.user.id !== addon.user_id)
      ) {
        return res.status(403).json({
          status: "fail",
          message: "Addon ini belum tersedia untuk publik",
        });
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Detail addon berhasil diambil",
      data: addon,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};
