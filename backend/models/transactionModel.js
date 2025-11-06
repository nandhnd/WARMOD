import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Store from "./storeModel.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    invoice_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED", "EXPIRED"),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

// 🔗 Relasi
Transaction.belongsTo(User, { foreignKey: "user_id" });
Transaction.belongsTo(Store, { foreignKey: "store_id" });

export default Transaction;
