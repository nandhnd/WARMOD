import { midtrans } from "../config/midtrans.js";
import Transaction from "../models/transactionModel.js";
import TransactionItem from "../models/transactionItemModel.js";
import Addon from "../models/addonModel.js";
import Cart from "../models/cartModel.js"; // pastikan model cart sudah ada
import Store from "../models/storeModel.js";
import SellerBalance from "../models/sellerBalanceModel.js";

// ====================================================
// 🔹 CREATE TRANSACTION (Instant Checkout - langsung beli 1 addon)
// ====================================================
export const instantCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addon_id } = req.body;

    const addon = await Addon.findByPk(addon_id);
    if (!addon)
      return res.status(404).json({ message: "Addon tidak ditemukan" });

    const store = await Store.findByPk(addon.store_id);
    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan" });

    // 🔹 Cek apakah user sudah pernah membeli addon ini
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
        message:
          "Anda sudah pernah membeli addon ini, tidak dapat membeli lagi.",
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

    // 🔹 Request ke Midtrans
    const parameter = {
      payment_type: "qris",
      transaction_details: {
        order_id: referenceId,
        gross_amount: addon.price,
      },
      qris: { acquirer: "gopay" },
      customer_details: {
        email: req.user.email,
        first_name: req.user.username,
      },
    };

    const midtransResponse = await midtrans.charge(parameter);

    transaction.invoice_id = midtransResponse.transaction_id;
    await transaction.save();

    res.status(201).json({
      message: "Transaksi berhasil dibuat, silakan scan QR untuk membayar",
      transaction,
      qr_string:
        midtransResponse.actions?.find((a) => a.name === "qr_string")?.url ||
        null,
      qr_url:
        midtransResponse.actions?.find((a) => a.name === "deeplink-redirect")
          ?.url || null,
      midtrans_response: midtransResponse,
    });
  } catch (error) {
    console.error("instantCheckout error:", error.ApiResponse || error.message);
    res.status(500).json({ message: error.message });
  }
};

// ====================================================
// 🔹 CART CHECKOUT (Multi Store + Cegah Pembelian Ulang + Update Saldo Penjual)
// ====================================================
export const cartCheckout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil isi keranjang user
    const cartItems = await Cart.findAll({ where: { user_id: userId } });
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    // Ambil semua addon berdasarkan cart
    const addons = await Addon.findAll({
      where: { id: cartItems.map((item) => item.addon_id) },
    });

    if (!addons.length)
      return res.status(404).json({ message: "Addon tidak ditemukan" });

    // 🔹 Cek apakah user sudah pernah membeli addon yang sama (PENDING / PAID)
    const existingTransactions = await Transaction.findAll({
      where: {
        user_id: userId,
        payment_status: ["PENDING", "PAID"],
      },
      include: [{ model: TransactionItem, as: "items" }],
    });

    const purchasedAddonIds = new Set(
      existingTransactions.flatMap((t) => t.items.map((item) => item.addon_id))
    );

    const newAddons = addons.filter((a) => !purchasedAddonIds.has(a.id));

    if (newAddons.length === 0) {
      return res.status(400).json({
        message:
          "Semua addon di keranjang sudah pernah dibeli atau masih menunggu pembayaran.",
      });
    }

    // 🔹 Kelompokkan addons berdasarkan store_id agar bisa multi-store checkout
    const groupedByStore = newAddons.reduce((acc, addon) => {
      if (!acc[addon.store_id]) acc[addon.store_id] = [];
      acc[addon.store_id].push(addon);
      return acc;
    }, {});

    const createdTransactions = [];

    // 🔹 Loop per store dan buat transaksi
    for (const [storeId, storeAddons] of Object.entries(groupedByStore)) {
      const totalAmount = storeAddons.reduce((sum, a) => sum + a.price, 0);
      const referenceId = `trx-${Date.now()}-${storeId}`;

      const transaction = await Transaction.create({
        reference_id: referenceId,
        user_id: userId,
        store_id: storeId,
        amount: totalAmount,
        payment_method: "QRIS",
        payment_status: "PENDING",
      });

      // Simpan item transaksi
      for (const addon of storeAddons) {
        await TransactionItem.create({
          transaction_id: transaction.id,
          addon_id: addon.id,
          price: addon.price,
        });
      }

      // 🔹 Request ke Midtrans
      const parameter = {
        payment_type: "qris",
        transaction_details: {
          order_id: referenceId,
          gross_amount: totalAmount,
        },
        qris: { acquirer: "gopay" },
        customer_details: {
          email: req.user.email,
          first_name: req.user.username,
        },
      };

      const midtransResponse = await midtrans.charge(parameter);

      transaction.invoice_id = midtransResponse.transaction_id;
      await transaction.save();

      createdTransactions.push({
        store_id: storeId,
        transaction,
        midtrans_response: midtransResponse,
        qr_string:
          midtransResponse.actions?.find((a) => a.name === "qr_string")?.url ||
          null,
        qr_url:
          midtransResponse.actions?.find((a) => a.name === "deeplink-redirect")
            ?.url || null,
      });

      // 🔹 Update saldo penjual (seller balance)
      const store = await Store.findByPk(storeId);
      if (store) {
        store.sellerBalance = (store.sellerBalance || 0) + totalAmount;
        await store.save();
      }
    }

    // 🔹 Hapus item dari cart
    await Cart.destroy({ where: { user_id: userId } });

    res.status(201).json({
      message: "Checkout berhasil, silakan scan QR untuk membayar",
      transactions: createdTransactions,
    });
  } catch (error) {
    console.error("cartCheckout error:", error.ApiResponse || error.message);
    res.status(500).json({ message: error.message });
  }
};

// ====================================================
// 🔹 WEBHOOK dari Midtrans
// ====================================================
export const midtransWebhook = async (req, res) => {
  try {
    const notification = req.body;
    const { order_id, transaction_status } = notification;

    const transaction = await Transaction.findOne({
      where: { reference_id: order_id },
    });
    if (!transaction)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });

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

    // 🔹 Jika berhasil dibayar → update sold_count addon
    if (transaction_status === "settlement") {
      const items = await TransactionItem.findAll({
        where: { transaction_id: transaction.id },
      });

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

    res.status(200).json({ message: "Status transaksi diperbarui" });
  } catch (error) {
    console.error("midtransWebhook error:", error);
    res.status(500).json({ message: error.message });
  }
};
