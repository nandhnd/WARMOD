import SellerBalance from "../models/sellerBalanceModel.js";
import Store from "../models/storeModel.js";
import { getStoreBalance } from "../utils/balanceUtils.js";

// GET: Total Saldo Seller
export const getSellerBalance = async (req, res) => {
  try {
    const { store_id } = req.params;
    const userId = req.user.id;

    const store = await Store.findByPk(store_id);
    if (!store)
      return res.status(404).json({
        status: "fail",
        message: "Toko tidak ditemukan",
      });

    const balance = await getStoreBalance(store_id);

    if (store.user_id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Anda tidak memiliki izin",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Data ditemukan",
      data: {
        store_id,
        balance,
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

// GET: Riwayat transaksi saldo seller
export const getSellerBalanceHistory = async (req, res) => {
  try {
    const { store_id } = req.params;
    const userId = req.user.id;

    // Cek apakah store ada
    const store = await Store.findByPk(store_id);
    if (!store) {
      return res.status(404).json({
        status: "fail",
        message: "Toko tidak ditemukan",
      });
    }

    // Hanya admin atau pemilik toko yang boleh mengakses
    if (req.user.role !== "admin" && store.user_id !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "Anda tidak memiliki izin",
      });
    }

    // Ambil data riwayat saldo
    const histories = await SellerBalance.findAll({
      where: { store_id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Riwayat saldo berhasil diambil",
      data: histories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};
