import Store from "../models/storeModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import TransactionItem from "../models/transactionItemModel.js";
import SellerBalance from "../models/sellerBalanceModel.js";
import Addon from "../models/addonModel.js";

// User: Create store
export const createStore = async (req, res) => {
  try {
    const userId = req.user.id; // ambil dari JWT middleware
    const { name, description } = req.body;

    // Cek apakah user sudah punya store
    const existingStore = await Store.findOne({ where: { user_id: userId } });
    if (existingStore) {
      return res.status(400).json({
        status: "fail",
        message: "User sudah memiliki store",
      });
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

    return res.status(201).json({
      status: "success",
      message: "Store berhasil dibuat",
      data: {
        store,
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

// Admin: update status toko user
export const updateStoreStatus = async (req, res) => {
  try {
    const storeId = req.params.id;
    const { status } = req.body; // active / inactive

    const store = await Store.findByPk(storeId, {
      include: { model: User, as: "user", attributes: ["id", "username"] },
    });

    if (!store)
      return res.status(404).json({
        status: "fail",
        message: "Store tidak ditemukan",
      });

    store.status = status;
    await store.save();

    return res.status(200).json({
      status: "success",
      message: "Status toko berhasil diperbarui",
      data: {
        store,
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

// User: update data store miliknya sendiri
export const updateStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    const store = await Store.findOne({ where: { user_id: userId } });
    if (!store) {
      return res.status(404).json({
        status: "fail",
        message: "Store tidak ditemukan",
      });
    }

    if (store.user_id !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "Anda tidak memiliki izin untuk mengubah data ini",
      });
    }

    // Update field yang dikirim
    store.name = name ?? store.name;
    store.description = description ?? store.description;

    await store.save();

    return res.status(200).json({
      status: "success",
      message: "Store berhasil diperbarui",
      data: {
        store,
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

// Admin & User: get store
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "username"] },
      ],
    });

    if (!store) {
      return res.status(404).json({
        status: "fail",
        message: "Store tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Data store ditemukan",
      data: {
        store,
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

// User: get store miliknya + statistik toko
export const getStore = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil store milik user ini
    const store = await Store.findOne({
      where: { user_id: userId },
      include: [
        { model: User, as: "user", attributes: ["id", "email", "username"] },
      ],
    });

    if (!store) {
      return res.status(404).json({
        status: "fail",
        message: "User belum memiliki store",
      });
    }

    // Total item terjual
    const totalSold = await TransactionItem.count({
      include: [
        {
          model: Transaction,
          where: {
            store_id: store.id,
            payment_status: "paid",
          },
        },
      ],
    });

    // Hitung total credit
    const totalCredit = await SellerBalance.sum("amount", {
      where: {
        store_id: store.id,
        type: "credit",
      },
    });
    // Hitung total debit
    const totalDebit = await SellerBalance.sum("amount", {
      where: {
        store_id: store.id,
        type: "debit",
      },
    });
    // Saldo akhir
    const sellerBalance = (totalCredit || 0) - (totalDebit || 0);

    const addonsTotal = await Addon.count({ where: { store_id: store.id } });

    return res.status(200).json({
      status: "success",
      message: "Data store ditemukan",
      data: {
        store,
        sellerBalance: sellerBalance || 0,
        totalIncome: totalCredit || 0,
        totalSold: totalSold || 0,
        totalAddons: addonsTotal || 0,
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

export const getStoreAddons = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil store milik user ini
    const store = await Store.findOne({
      where: { user_id: userId },
    });
    if (!store) {
      return res.status(404).json({
        status: "fail",
        message: "User belum memiliki store",
      });
    }

    // Ambil addons/mods milik store ini
    const addons = await Addon.findAll({
      where: { store_id: store.id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Data addons/mods ditemukan",
      data: addons,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};
