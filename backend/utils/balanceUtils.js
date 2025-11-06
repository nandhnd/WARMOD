import SellerBalance from "../models/sellerBalanceModel.js";
import { Sequelize } from "sequelize";

export const getStoreBalance = async (store_id) => {
  const result = await SellerBalance.findAll({
    where: { store_id },
    attributes: [
      "type",
      [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
    ],
    group: ["type"],
  });

  let credit = 0;
  let debit = 0;

  result.forEach((r) => {
    if (r.type === "credit") credit = parseFloat(r.get("total"));
    else if (r.type === "debit") debit = parseFloat(r.get("total"));
  });

  return credit - debit;
};
