import Cart from "../models/cartModel.js";
import Addon from "../models/addonModel.js";
import Transaction from "../models/transactionModel.js";
import TransactionItem from "../models/transactionItemModel.js";

// User: Tambah addon ke cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // dari JWT
    const { addon_id } = req.body;

    // Cek apakah addon ada
    const addon = await Addon.findByPk(addon_id);
    if (!addon) {
      return res.status(404).json({
        status: "fail",
        message: "Addon tidak ditemukan",
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

    // Cek apakah sudah ada di cart
    const existing = await Cart.findOne({
      where: { user_id: userId, addon_id },
    });

    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "Addon sudah ada di keranjang",
      });
    }

    const cartItem = await Cart.create({
      user_id: userId,
      addon_id,
      subtotal: addon.price,
    });

    return res.status(201).json({
      status: "success",
      message: "Addon ditambahkan ke keranjang",
      data: {
        cartItem,
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

// User: Lihat isi cart user
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Addon,
          attributes: ["id", "title", "price", "game"],
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      message: "Data cart ditemukan",
      data: {
        items,
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

// User: Hapus 1 item dari cart
export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = req.params.id;

    const item = await Cart.findOne({
      where: { id: cartId, user_id: userId },
    });

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Item tidak ditemukan di keranjang",
      });
    }

    await item.destroy();
    return res.status(204).json({
      status: "success",
      message: "Item dihapus dari keranjang",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};

// User: Kosongkan seluruh cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.destroy({ where: { user_id: userId } });

    return res.status(204).json({
      status: "success",
      message: "Keranjang dikosongkan",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      code: error.message,
    });
  }
};
