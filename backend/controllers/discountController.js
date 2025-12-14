import Discount from "../models/discountModel.js";
import DiscountItem from "../models/discountItemModel.js";
import Addon from "../models/addonModel.js";
import Store from "../models/storeModel.js";
import { Op } from "sequelize";
import e from "express";

export const createDiscount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { percentage, start_at, end_at, addon_ids = [] } = req.body;

    // Cek apakah user punya store
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store) {
      return res.status(403).json({
        status: "fail",
        message: "User belum memiliki toko",
      });
    }

    // Validasi addon milik store
    const validAddons = await Addon.findAll({
      where: {
        id: addon_ids,
        store_id: store.id,
      },
    });

    if (validAddons.length !== addon_ids.length) {
      return res.status(400).json({
        status: "fail",
        message: "Terdapat addon yang tidak dimiliki oleh user",
      });
    }

    // Buat diskon
    const discount = await Discount.create({
      percentage,
      start_at,
      end_at,
      store_id: store.id, // penting
      status: "inactive",
    });

    // Simpan addon terkait
    const discountItems = addon_ids.map((addon_id) => ({
      discount_id: discount.id,
      addon_id,
    }));

    await DiscountItem.bulkCreate(discountItems);

    return res.status(201).json({
      status: "success",
      message: "Diskon berhasil dibuat",
      data: {
        discount,
        items: discountItems,
      },
    });
  } catch (error) {
    console.error("createDiscount error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal membuat diskon",
    });
  }
};

export const getSellerDiscounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const local = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const store = await Store.findOne({
      where: { user_id: userId },
    });
    if (!store) {
      return res.status(403).json({
        status: "fail",
        message: "User belum memiliki toko",
      });
    }

    const discounts = await Discount.findAll({
      where: {
        store_id: store.id,
        end_at: {
          [Op.gt]: local,
        },
      },
      include: [
        {
          model: DiscountItem,
          include: [{ model: Addon }],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    const flatDiscounts = [];

    discounts.forEach((discount) => {
      const persentase = discount.percentage;
      const tanggalMulai = discount.start_at;
      const tanggalBerakhir = discount.end_at;
      const createdAt = discount.createdAt;

      discount.DiscountItems.forEach((item) => {
        const produk = item.Addon;

        const hargaAsli = produk?.price || 0;

        const discountAmount = hargaAsli * (persentase / 100);
        const hargaDiskon = Math.round(hargaAsli - discountAmount);

        const gambarProduk = produk?.images?.[0] || "";

        flatDiscounts.push({
          id: item.id, // ID unik per produk yang didiskon (dari DiscountItem)
          produkId: produk.id,
          namaProduk: produk.title,
          gambarProduk: gambarProduk,
          hargaAsli: hargaAsli,
          persentase: persentase,
          hargaDiskon: hargaDiskon,
          tanggalMulai: tanggalMulai,
          tanggalBerakhir: tanggalBerakhir,
          createdAt: createdAt,
          DiscountId: discount.id,
        });
      });
    });

    return res.status(200).json({
      status: "success",
      data: flatDiscounts,
    });
  } catch (error) {
    console.error("getSellerDiscounts error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil daftar diskon",
    });
  }
};

export const AvailableForDiscount = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const local = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const store = await Store.findOne({
      where: { user_id: userId },
    });

    if (!store) {
      return res.status(403).json({
        status: "fail",
        message: "User belum memiliki toko",
      });
    }

    const withDiscounts = await Discount.findAll({
      where: {
        store_id: store.id,
        end_at: {
          [Op.gt]: local,
        },
      },
      include: [
        {
          model: DiscountItem,
          include: [{ model: Addon }],
        },
      ],
    });

    let excludedAddonIds = withDiscounts.flatMap((discount) => {
      if (discount.DiscountItems && Array.isArray(discount.DiscountItems)) {
        return discount.DiscountItems.map((item) => item.addon_id);
      }
      return [];
    });

    const availableAddons = await Addon.findAll({
      where: {
        store_id: store.id,
        id: {
          [Op.notIn]: excludedAddonIds,
        },
        status: "approved", // Opsional: hanya tampilkan produk yang disetujui
      },
      attributes: ["id", "title", "price", "game", "images"], // Pilih hanya kolom yang dibutuhkan FE
      order: [["title", "ASC"]],
    });

    return res.status(200).json({
      status: "success",
      data: availableAddons,
    });
  } catch (error) {
    console.error("getSellerDiscounts error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil daftar diskon",
    });
  }
};

export const updateDiscount = async (req, res) => {
  try {
    const userId = req.user.id;
    const discountId = req.params.id;
    const { percentage, start_at, end_at, addon_ids = [] } = req.body;

    // Ambil store
    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store) {
      return res.status(403).json({
        status: "fail",
        message: "User belum memiliki toko",
      });
    }

    // Ambil diskon yg milik store
    const discount = await Discount.findOne({
      where: { id: discountId, store_id: store.id },
      include: [{ model: DiscountItem }],
    });

    if (!discount) {
      return res.status(404).json({
        status: "fail",
        message: "Diskon tidak ditemukan atau bukan milik toko Anda",
      });
    }

    // Validasi addon milik store
    const validAddons = await Addon.findAll({
      where: {
        id: addon_ids,
        store_id: store.id,
      },
    });

    if (validAddons.length !== addon_ids.length) {
      return res.status(400).json({
        status: "fail",
        message: "Terdapat addon yang tidak dimiliki oleh store Anda",
      });
    }

    // Update diskon
    await discount.update({
      percentage: percentage ?? discount.percentage,
      start_at: start_at ?? discount.start_at,
      end_at: end_at ?? discount.end_at,
    });

    // Hapus diskon items lama
    await DiscountItem.destroy({ where: { discount_id: discount.id } });

    // Tambahkan yg baru
    const discountItems = addon_ids.map((addon_id) => ({
      discount_id: discount.id,
      addon_id,
    }));

    await DiscountItem.bulkCreate(discountItems);

    return res.status(200).json({
      status: "success",
      message: "Diskon berhasil diperbarui",
      data: {
        discount,
        items: discountItems,
      },
    });
  } catch (error) {
    console.error("updateDiscount error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal memperbarui diskon",
    });
  }
};
