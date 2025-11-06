import Cart from "../models/cartModel.js";
import Addon from "../models/addonModel.js";

// ✅ Tambah addon ke cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // dari JWT
    const { addon_id } = req.body;

    // Cek apakah addon ada
    const addon = await Addon.findByPk(addon_id);
    if (!addon) {
      return res.status(404).json({ message: "Addon tidak ditemukan" });
    }

    // Cek apakah sudah ada di cart
    const existing = await Cart.findOne({
      where: { user_id: userId, addon_id },
    });
    if (existing) {
      return res.status(400).json({ message: "Addon sudah ada di keranjang" });
    }

    const cartItem = await Cart.create({
      user_id: userId,
      addon_id,
      subtotal: addon.price,
    });

    res.status(201).json({
      message: "Addon ditambahkan ke keranjang",
      cart: cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lihat isi cart user
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

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Hapus 1 item dari cart
export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = req.params.id;

    const item = await Cart.findOne({
      where: { id: cartId, user_id: userId },
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item tidak ditemukan di keranjang" });
    }

    await item.destroy();
    res.status(200).json({ message: "Item dihapus dari keranjang" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Kosongkan seluruh cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.destroy({ where: { user_id: userId } });

    res.status(200).json({ message: "Keranjang dikosongkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
