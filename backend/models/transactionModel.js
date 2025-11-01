import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Addon from "./addonModel.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    addon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Addon,
        key: "id",
      },
    },
    xendit_invoice_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING, // "QRIS", "EWALLET", "VA", dll.
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "expired", "failed"),
      defaultValue: "pending",
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

User.hasMany(Transaction, { foreignKey: "user_id", onDelete: "CASCADE" });
Transaction.belongsTo(User, { foreignKey: "user_id" });

Addon.hasMany(Transaction, { foreignKey: "addon_id", onDelete: "CASCADE" });
Transaction.belongsTo(Addon, { foreignKey: "addon_id" });

export default Transaction;
