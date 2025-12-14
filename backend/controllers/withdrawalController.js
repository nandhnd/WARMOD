import WithdrawalRequest from "../models/withdrawalRequestModel.js";
import Store from "../models/storeModel.js";
import SellerBalance from "../models/sellerBalanceModel.js";
import { getStoreBalance } from "../utils/balanceUtils.js";
import User from "../models/userModel.js";

// User: Penjual mengajukan penarikan saldo
export const createWithdrawalRequest = async (req, res) => {
  try {
    const { amount, bank_name, account_number, account_holder } = req.body;
    const store = await Store.findOne({ where: { user_id: req.user.id } });

    if (!store)
      return res.status(404).json({
        status: "fail",
        message: "Toko tidak ditemukan",
      });

    const ongoingWithdrawal = await WithdrawalRequest.findOne({
      where: {
        store_id: store.user_id,
        status: "PENDING",
      },
    });

    if (ongoingWithdrawal)
      return res.status(400).json({
        status: "fail",
        message: "Ada penarikan saldo yang berjalan",
      });

    const currentBalance = await getStoreBalance(store.id);
    if (amount > currentBalance)
      return res.status(400).json({
        status: "fail",
        message: "Saldo tidak mencukupi",
      });

    const withdrawal = await WithdrawalRequest.create({
      store_id: store.id,
      amount,
      bank_name,
      account_number,
      account_holder,
    });

    return res.status(201).json({
      status: "success",
      message: "Berhasil membuat permintaan penarikan saldo",
      data: {
        withdrawal,
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

// Admin: melihat semua pengajuan
export const getAllWithdrawals = async (req, res) => {
  try {
    const rawWithdrawals = await WithdrawalRequest.findAll({
      include: [
        {
          model: Store,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email", "username"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const withdrawalsWithBalance = await Promise.all(
      rawWithdrawals.map(async (withdrawal) => {
        const storeId = withdrawal.Store.id;
        const currentBalance = await getStoreBalance(storeId);
        return {
          ...withdrawal.get({ plain: true }),
          currentBalance: currentBalance.toString() || 0,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      message: "Data penarikan saldo ditemukan",
      data: {
        withdrawals: withdrawalsWithBalance,
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

// Admin: update status pengajuan (APPROVED / REJECTED / TRANSFERRED)
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const withdrawal = await WithdrawalRequest.findByPk(id);
    if (!withdrawal)
      return res.status(404).json({
        status: "fail",
        message: "Pengajuan tidak ditemukan",
      });

    // Cegah update ulang jika sudah transferred
    if (withdrawal.status === "TRANSFERRED")
      return res.status(400).json({
        status: "fail",
        message: "Transaksi sudah ditransfer",
      });

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
      // Kurangi saldo toko
      await SellerBalance.create({
        store_id: withdrawal.store_id,
        type: "debit",
        amount: withdrawal.amount, // kurangi saldo
        description: `Penarikan saldo #${withdrawal.id}`,
      });

      withdrawal.status = "TRANSFERRED";
      withdrawal.notes = notes || "Dana telah ditransfer ke penjual";
    }

    // === Status tidak valid ===
    else {
      return res.status(400).json({
        status: "fail",
        message: "Status tidak valid",
      });
    }

    await withdrawal.save();

    return res.status(200).json({
      status: "success",
      message: "Status pengajuan diperbarui menjadi ${withdrawal.status}",
      data: {
        withdrawal,
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

export const getOngoingWithdrawal = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { user_id: req.user.id } });

    if (!store)
      return res.status(404).json({
        status: "fail",
        message: "Toko tidak ditemukan",
      });

    const ongoingWithdrawal = await WithdrawalRequest.findOne({
      where: {
        store_id: store.user_id,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Penarikan saldo dalam pending ditemukan",
      data: {
        ongoingWithdrawal,
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
