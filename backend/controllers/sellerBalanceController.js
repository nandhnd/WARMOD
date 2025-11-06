import SellerBalance from "../models/sellerBalanceModel.js";
import Store from "../models/storeModel.js";
import { getStoreBalance } from "../utils/balanceUtils.js";

// 🔹 GET: Total Saldo Seller
export const getSellerBalance = async (req, res) => {
  try {
    const { store_id } = req.params;

    const store = await Store.findByPk(store_id);
    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan" });

    const balance = await getStoreBalance(store_id);

    res.json({
      store_id,
      balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil saldo" });
  }
};

// 🔹 GET: Riwayat transaksi saldo seller
export const getSellerBalanceHistory = async (req, res) => {
  try {
    const { store_id } = req.params;

    const histories = await SellerBalance.findAll({
      where: { store_id },
      order: [["createdAt", "DESC"]],
    });

    res.json(histories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil riwayat saldo" });
  }
};

// 🔹 POST: Tarik saldo (Withdraw)
export const withdrawSellerBalance = async (req, res) => {
  try {
    const { store_id } = req.params;
    const { amount } = req.body;

    const store = await Store.findByPk(store_id);
    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan" });

    const balance = await getStoreBalance(store_id);

    if (amount > balance)
      return res.status(400).json({ message: "Saldo tidak mencukupi" });

    // Tambahkan transaksi debit
    await SellerBalance.create({
      store_id,
      type: "debit",
      amount,
      description: "Penarikan saldo",
    });

    res.status(201).json({ message: "Penarikan saldo berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal melakukan penarikan saldo" });
  }
};
