import Cart from "../models/cartModel.js";
import Addon from "../models/addonModel.js";
import Transaction from "../models/transactionModel.js";
import TransactionItem from "../models/transactionItemModel.js";
import Discount from "../models/discountModel.js";
import DiscountItem from "../models/discountItemModel.js";

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
          attributes: ["id", "title", "price", "game", "images"],
          include: [
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
        },
      ],
    });

    const result = items.map((cartItem) => {
      const addon = cartItem.Addon;

      // Ambil diskon pertama kalau ada
      const item = addon?.DiscountItems?.[0];
      const discount = item?.Discount?.percentage || null;
      const endDate = item?.Discount?.end_at || null;

      const finalPrice =
        discount !== null
          ? addon.price - (addon.price * discount) / 100
          : addon.price;

      return {
        cartId: cartItem.id,
        addonId: addon.id,
        title: addon.title,
        category: addon.game,
        image: addon.images,
        price: finalPrice,
        originalPrice: addon.price,
        discount,
        discountEndDate: endDate,
        quantity: cartItem.quantity || 1,
      };
    });

    return res.status(200).json({
      message: "Berhasil mengambil cart",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
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
