import { midtrans } from "../config/midtrans.js";
import Transaction from "../models/transactionModel.js";
import TransactionItem from "../models/transactionItemModel.js";
import Addon from "../models/addonModel.js";
import Cart from "../models/cartModel.js";
import Store from "../models/storeModel.js";
import SellerBalance from "../models/sellerBalanceModel.js";
import User from "../models/userModel.js";
import { sendAddonEmail } from "../utils/emailUtils.js";

// User: create instant checkout
export const instantCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addon_id } = req.body;

    const addon = await Addon.findByPk(addon_id);
    if (!addon)
      return res.status(404).json({
        status: "fail",
        message: "Addon tidak ditemukan",
      });

    const store = await Store.findByPk(addon.store_id);
    if (!store)
      return res.status(404).json({
        status: "fail",
        message: "Toko tidak ditemukan",
      });

    if (store.user_id == userId) {
      return res.status(403).json({
        status: "fail",
        message: "Tidak bisa membeli addon milik sendiri",
      });
    }

    if (req.user.role == "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Admin tidak bisa membeli addon",
      });
    }

    // Cek apakah user sudah pernah membeli addon ini
    const alreadyPurchased = await Transaction.findOne({
      where: { user_id: userId, payment_status: ["PAID", "PENDING"] },
      include: [
        {
          model: TransactionItem,
          as: "items",
          where: { addon_id },
        },
      ],
    });

    if (alreadyPurchased) {
      return res.status(400).json({
        status: "fail",
        message:
          "Anda sudah pernah membeli addon ini, tidak dapat membeli lagi",
      });
    }

    const referenceId = `trx-${Date.now()}`;

    // Simpan transaksi ke DB
    const transaction = await Transaction.create({
      reference_id: referenceId,
      user_id: userId,
      store_id: store.id,
      amount: addon.price,
      payment_method: "QRIS",
      payment_status: "PENDING",
    });

    // Simpan detail item
    await TransactionItem.create({
      transaction_id: transaction.id,
      addon_id: addon.id,
      price: addon.price,
    });

    // Request ke Midtrans
    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: referenceId,
        gross_amount: addon.price,
      },
      customer_details: {
        email: req.user.email,
        first_name: req.user.username,
      },
      custom_expiry: {
        expiry_duration: 1,
        unit: "hour",
      },
    };

    const midtransResponse = await midtrans.charge(parameter);

    transaction.invoice_id = midtransResponse.transaction_id;
    await transaction.save();

    return res.status(201).json({
      status: "success",
      message: "Transaksi berhasil dibuat, scan QR untuk membayar",
      data: {
        transaction,
        midtrans_response: midtransResponse,
      },
    });
  } catch (error) {
    console.error("instantCheckout error:", error.ApiResponse || error.message);
    res.status(500).json({ message: error.message });
  }
};

// User: create cart checkout
export const cartCheckout = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role === "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Admin tidak bisa membeli addon",
      });
    }

    const existing = await Transaction.findOne({
      where: {
        user_id: userId,
        payment_status: "PENDING",
      },
      order: [["createdAt", "DESC"]],
    });

    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Anda memiliki transaksi yang belum selesai",
      });
    }

    // Ambil isi cart user
    const cartItems = await Cart.findAll({ where: { user_id: userId } });
    if (cartItems.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "Keranjang kosong",
      });
    }

    // Ambil data addon
    const addons = await Addon.findAll({
      where: { id: cartItems.map((c) => c.addon_id) },
    });

    // Hitung total
    const totalAmount = addons.reduce((sum, item) => sum + item.price, 0);

    const orderId = `WM-${Date.now()}`;
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    // MIDTRANS PARAMETER
    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      custom_expiry: {
        expiry_duration: 1,
        unit: "hour",
      },
    };

    // REQUEST MIDTRANS
    const midtransResponse = await midtrans.charge(parameter);

    // Simpan transaksi
    const trx = await Transaction.create({
      reference_id: orderId,
      user_id: userId,
      amount: totalAmount,
      store_id: addons[0].store_id,
      payment_method: "QRIS",
      payment_status: "PENDING",
      invoice_id: midtransResponse.transaction_id,
      expiresAt: midtransResponse.expiry_time,
      qrisImage: midtransResponse.actions[0].url,
    });

    // Simpan detail transaksi
    for (const addon of addons) {
      await TransactionItem.create({
        transaction_id: trx.id,
        addon_id: addon.id,
        price: addon.price,
      });
    }

    // Hapus cart
    await Cart.destroy({ where: { user_id: userId } });

    return res.status(200).json({
      status: "success",
      message: "QRIS dibuat",
      data: {
        orderId,
        totalAmount,
        expiresAt: expiry,
        qrisImage: midtransResponse.actions.url || null,
      },
      midtrans_response: midtransResponse,
    });
  } catch (error) {
    console.error("cartCheckout Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

// Webhook dari midtrans
export const midtransWebhook = async (req, res) => {
  try {
    const notification = req.body;
    const { order_id, transaction_status } = notification;

    const transaction = await Transaction.findOne({
      where: { reference_id: order_id },
    });
    if (!transaction)
      return res.status(404).json({
        status: "fail",
        message: "Transaksi tidak ditemukan",
      });

    // Update status
    switch (transaction_status) {
      case "settlement":
        transaction.payment_status = "PAID";
        break;
      case "pending":
        transaction.payment_status = "PENDING";
        break;
      case "deny":
      case "cancel":
      case "expire":
        transaction.payment_status = "FAILED";
        break;
      default:
        transaction.payment_status = "UNKNOWN";
    }

    await transaction.save();

    const user = await User.findByPk(transaction.user_id);

    const items = await TransactionItem.findAll({
      where: { transaction_id: transaction.id },
      include: [
        {
          model: Addon,
        },
      ],
    });

    if (transaction_status === "settlement") {
      await sendAddonEmail({
        to: user.email,
        username: user.username,
        transaction,
        addons: items.map((i) => ({
          name: i.Addon.title,
          price: i.price,
          link: i.Addon.link,
        })),
      });
    }

    // Jika berhasil dibayar → update sold_count addon
    if (transaction_status === "settlement") {
      for (const item of items) {
        const addon = await Addon.findByPk(item.addon_id);
        if (addon) {
          addon.sold_count = (addon.sold_count || 0) + 1;
          await addon.save();
        }
      }
    }

    // Tambahkan saldo ke seller
    if (transaction_status === "settlement") {
      const existing = await SellerBalance.findOne({
        where: {
          store_id: transaction.store_id,
          description: `Pembayaran transaksi #${transaction.reference_id}`,
        },
      });

      if (!existing) {
        await SellerBalance.create({
          store_id: transaction.store_id,
          type: "credit",
          amount: transaction.amount,
          description: `Pembayaran transaksi #${transaction.reference_id}`,
        });
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Webhook diproses & status transaksi diperbarui",
    });
  } catch (error) {
    console.error("midtransWebhook error:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};

export const getLatestCheckout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cek transaksi terakhir user yg masih pending
    const trx = await Transaction.findOne({
      where: {
        user_id: userId,
        payment_status: "PENDING",
      },
      order: [["createdAt", "DESC"]],
    });

    if (!trx) {
      return res.status(200).json({
        status: "success",
        message: "Tidak ada transaksi berjalan",
      });
    }

    // Ambil detail item yang dibeli
    const items = await TransactionItem.findAll({
      where: { transaction_id: trx.id },
      include: [
        {
          model: Addon,
          include: [{ model: Store }],
        },
      ],
    });

    // Format FE butuh: title, category, seller, price
    const formattedItems = items.map((item) => ({
      title: item.Addon.title,
      category: item.Addon.category,
      seller: item.Addon.Store?.name || "Unknown Store",
      price: item.price,
    }));

    return res.status(200).json({
      status: "success",
      data: {
        orderId: trx.reference_id,
        totalAmount: trx.amount,
        expiresAt: trx.expiresAt,
        qrisImage: trx.qrisImage,
        status: trx.payment_status,
        items: formattedItems,
      },
    });
  } catch (err) {
    console.error("getLatestCheckout Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: err.message,
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Addon,
              include: [{ model: Store }],
            },
          ],
        },
        {
          model: User,
          attributes: ["email"],
        },
      ],
    });

    const formatted = transactions.map((trx) => ({
      orderNumber: trx.reference_id,
      userEmail: trx.User?.email || "",
      paymentMethod: trx.payment_method?.toLowerCase() || "",
      status: trx.payment_status?.toLowerCase() || "",
      timestamp: trx.createdAt,
      items: trx.TransactionItems.map((item) => ({
        id: item.Addon.id,
        title: item.Addon.title,
        category: item.Addon.game,
        price: item.price,
        seller: item.Addon.Store?.name || "",
        image: item.Addon.images,
      })),
    }));

    return res.status(200).json({
      status: "success",
      data: {
        total: formatted.length,
        transactions: formatted,
      },
    });
  } catch (error) {
    console.error("getTransactionHistory Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSellerTransactionsHistory = async (req, res) => {
  try {
    const storeId = req.user.id;

    const transactions = await Transaction.findAll({
      where: { store_id: storeId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Addon,
              include: [{ model: Store }],
            },
          ],
        },
        {
          model: User,
          attributes: ["username", "email"],
        },
      ],
    });

    let results = transactions.map((trx) => {
      return {
        id: trx.reference_id || "",
        pembeli: {
          nama: trx.User?.username || "",
          email: trx.User?.email || "",
        },
        mod: {
          nama: trx.TransactionItems[0].Addon.title || "",
          harga: trx.TransactionItems[0].Addon.price || 0,
          kategori: trx.TransactionItems[0].Addon.game || "",
          gambar: trx.TransactionItems[0].Addon.images || "",
        },
        tanggal: trx.createdAt.toISOString() || "",
        status: trx.payment_status || "",
        total: trx.amount || 0,
        metodePembayaran: trx.payment_method || "",
      };
    });

    // console.log("Fetched transactions:", transactions[0]);
    return res.status(200).json({
      status: "success",
      message: "Seller transactions fetched successfully",
      data: results,
    });
  } catch (error) {
    console.error("getSellerTransactionsHistory Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAdminTransactionsHistory = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Addon,
              include: [
                {
                  model: Store,
                  include: [
                    {
                      model: User,
                      as: "user",
                      attributes: ["username", "email"], // Penjual
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: User, // Pembeli
          attributes: ["username", "email"],
        },
      ],
    });

    let results = transactions.map((trx) => {
      // Data Transaksi Utama
      const transactionId = trx.reference_id || "";
      const pembeli = {
        nama: trx.User?.username || "Guest",
        email: trx.User?.email || "N/A",
      };

      // Ambil data penjual dan daftar mod
      let penjual = { nama: "Unknown Seller", email: "N/A" };

      // Map TransactionItems untuk mendapatkan detail setiap Mod
      const daftarMod = trx.TransactionItems.map((item) => {
        const addon = item.Addon || {};
        const storeUser = addon.Store?.user || {};

        // Asumsi: Semua item dalam satu transaksi berasal dari penjual yang sama
        // Jika tidak, Anda harus menyesuaikan struktur output FE.
        if (storeUser.username) {
          penjual = {
            nama: storeUser.username,
            email: storeUser.email,
            toko: addon.Store.name,
          };
        }

        return {
          nama: addon.title || "Mod Tanpa Nama",
          harga: item.price || addon.price || 0, // Gunakan harga item jika ada
          kategori: addon.game || "Umum",
          deskripsi: addon.description || "",
        };
      });

      return {
        // ID Transaksi Utama
        id: transactionId,
        transactionId: transactionId, // Menyimpan dalam format yang sama dengan mock

        // Detail Pembeli & Penjual
        pembeli: pembeli,
        penjual: penjual, // Menggunakan penjual yang ditemukan di dalam item pertama/terakhir

        // Detail Produk (Daftar Mod)
        daftarMod: daftarMod, // Array berisi semua Mod yang dibeli

        // Detail Transaksi
        tanggal: trx.createdAt.toISOString() || "",
        status: trx.payment_status || "PENDING",
        totalBayar: trx.amount || 0, // Total keseluruhan didapat dari kolom 'amount' di tabel Transaction
        metodePembayaran: trx.payment_method || "",
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Admin transactions history fetched successfully",
      data: results, // Mengembalikan array 'results' (1 transaksi = 1 objek)
    });
  } catch (error) {
    console.error("getAdminTransactionsHistory Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
