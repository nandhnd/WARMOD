import Transaction from "./transactionModel.js";
import TransactionItem from "./transactionItemModel.js";
import Addon from "./addonModel.js";

// RELATIONS
Transaction.hasMany(TransactionItem, {
  foreignKey: "transaction_id",
});

TransactionItem.belongsTo(Transaction, {
  foreignKey: "transaction_id",
});

Addon.hasMany(TransactionItem, {
  foreignKey: "addon_id",
});

TransactionItem.belongsTo(Addon, {
  foreignKey: "addon_id",
});
