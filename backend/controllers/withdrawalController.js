import WithdrawalRequest from "../models/withdrawalRequestModel.js";
import Store from "../models/storeModel.js";
import SellerBalance from "../models/sellerBalanceModel.js";
import { getStoreBalance } from "../utils/balanceUtils.js";

// 🧾 Penjual mengajukan penarikan saldo
export const createWithdrawalRequest = async (req, res) => {
  try {
    const { amount, bank_name, account_number, account_holder } = req.body;
    const store = await Store.findOne({ where: { user_id: req.user.id } });

    if (!store)
      return res.status(404).json({ message: "Toko tidak ditemukan" });

    const currentBalance = await getStoreBalance(store.id);
    if (amount > currentBalance)
      return res.status(400).json({ message: "Saldo tidak mencukupi" });

    const withdrawal = await WithdrawalRequest.create({
      store_id: store.id,
      amount,
      bank_name,
      account_number,
      account_holder,
      status: "pending",
    });

    res.status(201).json({
      message: "Permintaan penarikan saldo diajukan",
      withdrawal,
    });
  } catch (error) {
    console.error("requestWithdrawal error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📋 Admin melihat semua pengajuan
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.findAll({
      include: [{ model: Store, as: "store" }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ withdrawals });
  } catch (error) {
    console.error("getAllWithdrawals error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin update status pengajuan (APPROVED / REJECTED / TRANSFERRED)
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const withdrawal = await WithdrawalRequest.findByPk(id);
    if (!withdrawal)
      return res.status(404).json({ message: "Pengajuan tidak ditemukan" });

    // Cegah update ulang jika sudah transferred
    if (withdrawal.status === "TRANSFERRED")
      return res.status(400).json({ message: "Transaksi sudah ditransfer" });

    // === APPROVED ===
    if (status === "APPROVED") {
      withdrawal.status = "APPROVED";
      withdrawal.notes = notes || "Disetujui oleh admin";
    }

    // === REJECTED ===
    else if (status === "REJECTED") {
      withdrawal.status = "REJECTED";
      withdrawal.notes = notes || "Ditolak oleh admin";
    }

    // === TRANSFERRED ===
    else if (status === "TRANSFERRED") {
      if (withdrawal.status !== "APPROVED")
        return res.status(400).json({
          message: "Hanya pengajuan yang disetujui yang bisa ditransfer",
        });

      // Kurangi saldo toko
      await SellerBalance.create({
        store_id: withdrawal.store_id,
        type: "debit",
        amount: -withdrawal.amount, // kurangi saldo
        description: `Penarikan saldo #${withdrawal.id}`,
      });

      withdrawal.status = "TRANSFERRED";
      withdrawal.notes = notes || "Dana telah ditransfer ke penjual";
    }

    // === Status tidak valid ===
    else {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    await withdrawal.save();

    res.json({
      message: `Status pengajuan diperbarui menjadi ${withdrawal.status}`,
      withdrawal,
    });
  } catch (error) {
    console.error("updateWithdrawalStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};
