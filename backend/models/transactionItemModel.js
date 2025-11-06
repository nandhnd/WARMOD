import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Transaction from "./transactionModel.js";
import Addon from "./addonModel.js";

const TransactionItem = sequelize.define(
  "TransactionItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Transaction,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    addon_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Addon,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "transaction_items",
  }
);

Transaction.hasMany(TransactionItem, {
  foreignKey: "transaction_id",
  as: "items",
});
TransactionItem.belongsTo(Addon, { foreignKey: "addon_id", as: "addon" });

export default TransactionItem;
