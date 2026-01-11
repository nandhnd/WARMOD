import Addon from "../models/addonModel.js";
import Store from "../models/storeModel.js";
import User from "../models/userModel.js";
import Discount from "../models/discountModel.js";
import DiscountItem from "../models/discountItemModel.js";

import { Op } from "sequelize";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // Kumpulkan URL dari file yang di-upload
    const imageUrls =
      req.files?.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/api/uploads/${file.filename}`
      ) || [];

    if (imageUrls.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Minimal upload 1 gambar",
      });
    }

    const uploadedFilenames = req.files.map((file) => file.filename);

    const addon = await Addon.create({
      title,
      description,
      price,
      link,
      game,
      images: imageUrls,
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
    cleanupFiles(uploadedFilenames);
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
    res
      .status(200)
      .json({ status: "success", message: "Addon berhasil diperbarui", addon });
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

    // Hapus file gambar jika ada
    if (addon.images) {
      try {
        // Parse JSON string jika images disimpan sebagai string
        let imagesArray = addon.images;
        if (typeof addon.images === "string") {
          imagesArray = JSON.parse(addon.images);
        }

        if (Array.isArray(imagesArray)) {
          for (const imageUrl of imagesArray) {
            if (imageUrl) {
              // Ekstrak nama file dari URL
              // Contoh: "http://localhost:5000/api/uploads/IMG_1768038168669_4tf4o3yemzh.jpg"
              // Menjadi: "IMG_1768038168669_4tf4o3yemzh.jpg"
              const fileName = imageUrl.split("/").pop();

              if (fileName) {
                const imagePath = path.join(
                  __dirname,
                  "..",
                  "uploads",
                  fileName
                );

                // Cek apakah file ada
                if (fs.existsSync(imagePath)) {
                  // Hapus file
                  fs.unlinkSync(imagePath);
                  console.log(`File ${fileName} berhasil dihapus`);
                } else {
                  console.log(`File ${fileName} tidak ditemukan di server`);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error menghapus images:", error);
      }
    }

    await addon.destroy();

    res.status(200).json({ message: "Addon berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: lihat semua addon
export const getPendingAddons = async (req, res) => {
  try {
    const addons = await Addon.findAll({
      where: {
        status: "pending",
      },
      include: {
        model: Store,
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
      include: [
        {
          model: Store,
          attributes: ["id", "name"],
        },
        {
          model: DiscountItem,
          required: false,
          include: [
            {
              model: Discount,
              attributes: ["id", "percentage", "end_at"],
              where: {
                status: "active",
              },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = addons.map((addon) => {
      const item = addon.DiscountItems?.[0]; // Ambil diskon pertama jika ada

      let discount = null;
      let finalPrice = addon.price;
      let endDate = null;

      if (item && item.Discount) {
        discount = item.Discount.percentage;
        endDate = item.Discount.end_at;

        // Hitung final price
        finalPrice = addon.price - (addon.price * discount) / 100;
      }

      return {
        id: addon.id,
        title: addon.title,
        category: addon.game,
        id_store: addon.Store?.id || null,
        seller: addon.Store?.name || null,
        price: finalPrice, // harga setelah diskon
        originalPrice: addon.price, // harga asli
        discount: discount, // persentase
        discountEndDate: endDate,
        image: addon.images,
        downloads: addon.sold_count || 0,
      };
    });

    return res.status(200).json({
      message: "Berhasil mengambil addon yang disetujui",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

// Publik: lihat addon berdasarkan id
export const getAddonById = async (req, res) => {
  try {
    const addon = await Addon.findByPk(req.params.id, {
      include: [
        {
          model: Store,
          attributes: ["id", "name"],
        },
        {
          model: DiscountItem,
          include: [
            {
              model: Discount,
              attributes: ["id", "percentage", "end_at"],
            },
          ],
        },
      ],
    });

    if (!addon) {
      return res.status(404).json({
        status: "fail",
        message: "Addon tidak ditemukan",
      });
    }

    const storeId = await Store.findOne({
      where: { user_id: req.user?.id || null },
      attributes: ["id"],
    });

    // Jika belum approved → hanya pemilik atau admin
    if (addon.status !== "approved") {
      if (req.user.role !== "admin" && storeId.id !== addon.store_id) {
        return res.status(403).json({
          status: "fail",
          message: "Addon ini belum tersedia untuk publik",
        });
      }
    }

    let link = null;
    if (req.params.id == addon.id || req.user.role === "admin") {
      link = addon.link;
    }

    // --- Mapping diskon ---
    const item = addon.DiscountItems?.[0];
    let discount = null;
    let finalPrice = addon.price;
    let discountEnd = null;

    if (item && item.Discount) {
      discount = item.Discount.percentage;
      discountEnd = item.Discount.end_at;
      finalPrice = addon.price - (addon.price * discount) / 100;
    }

    // --- Mapping output sesuai FE ---
    const mapped = {
      id: addon.id,
      title: addon.title,
      description: addon.description,
      category: addon.game,
      seller: addon.Store?.name || null,

      price: finalPrice,
      originalPrice: addon.price,
      discount: discount,
      discountEndDate: discountEnd,
      link: link,
      status: addon.status,

      image: Array.isArray(addon.images) ? addon.images[0] : addon.images,
      images: Array.isArray(addon.images) ? addon.images : [],

      downloads: addon.sold_count || 0,

      createdAt: addon.createdAt,
      updatedAt: addon.updatedAt,
    };

    return res.status(200).json({
      status: "success",
      message: "Detail addon berhasil diambil",
      data: mapped,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};

const cleanupFiles = (filenames) => {
  // Tentukan direktori upload Anda (ganti jika path Anda berbeda)
  const uploadDir = path.join(__dirname, "..", "uploads"); // Sesuaikan path jika perlu

  filenames.forEach((filename) => {
    const filePath = path.join(uploadDir, filename);

    // Hapus file
    fs.unlink(filePath, (err) => {
      if (err) {
        // Log error jika gagal menghapus, tapi jangan hentikan eksekusi
        console.error(`Gagal menghapus file: ${filePath}`, err);
      } else {
        console.log(`File berhasil dihapus: ${filePath}`);
      }
    });
  });
};
