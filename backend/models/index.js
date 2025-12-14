import Transaction from "./transactionModel.js";
import TransactionItem from "./transactionItemModel.js";
import Addon from "./addonModel.js";
import Discount from "./discountModel.js";
import DiscountItem from "./discountItemModel.js";
import Store from "./storeModel.js";
import WithdrawalRequest from "./withdrawalRequestModel.js";
import User from "./userModel.js";
import SellerBalance from "./sellerBalanceModel.js";
import Cart from "./cartModel.js";

// Transaction → TransactionItem
Transaction.hasMany(TransactionItem, { foreignKey: "transaction_id" });
TransactionItem.belongsTo(Transaction, { foreignKey: "transaction_id" });

// Transaction → User & Store
Transaction.belongsTo(User, { foreignKey: "user_id" });
Transaction.belongsTo(Store, { foreignKey: "store_id" });

// Addon → TransactionItem
Addon.hasMany(TransactionItem, { foreignKey: "addon_id" });
TransactionItem.belongsTo(Addon, { foreignKey: "addon_id" });

// Addon → Cart
Addon.hasMany(Cart, { foreignKey: "addon_id" });
Cart.belongsTo(Addon, { foreignKey: "addon_id" });

// Addon ↔ DiscountItem
Addon.hasMany(DiscountItem, { foreignKey: "addon_id" });
DiscountItem.belongsTo(Addon, { foreignKey: "addon_id" });

// Store → WithdrawalRequest
Store.hasMany(WithdrawalRequest, { foreignKey: "store_id" });
WithdrawalRequest.belongsTo(Store, { foreignKey: "store_id" });

// Store → Addon
Store.hasMany(Addon, { foreignKey: "store_id" });
Addon.belongsTo(Store, { foreignKey: "store_id" });

// Store → Discount
Store.hasMany(Discount, { foreignKey: "store_id" });
Discount.belongsTo(Store, { foreignKey: "store_id" });

// Store → Discount (alias)
Store.hasMany(Discount, { foreignKey: "store_id", as: "discounts" });

// Store → SellerBalance
Store.hasMany(SellerBalance, {
  foreignKey: "store_id",
  as: "balances",
  onDelete: "CASCADE",
});
SellerBalance.belongsTo(Store, { foreignKey: "store_id", as: "store" });

// User ↔ Store
User.hasOne(Store, { foreignKey: "user_id", as: "store", onDelete: "CASCADE" });
Store.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User → Cart
User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

// Discount → DiscountItem
Discount.hasMany(DiscountItem, { foreignKey: "discount_id" });
DiscountItem.belongsTo(Discount, { foreignKey: "discount_id" });

export {
  Transaction,
  TransactionItem,
  Addon,
  Discount,
  DiscountItem,
  Store,
  WithdrawalRequest,
  User,
  SellerBalance,
  Cart,
};
