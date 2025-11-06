import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Store from "./storeModel.js";

const WithdrawalRequest = sequelize.define(
  "WithdrawalRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Store,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_holder: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "TRANSFERRED"),
      defaultValue: "PENDING",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "withdrawal_requests",
    timestamps: true,
  }
);

Store.hasMany(WithdrawalRequest, { foreignKey: "store_id", as: "withdrawals" });
WithdrawalRequest.belongsTo(Store, { foreignKey: "store_id", as: "store" });

export default WithdrawalRequest;
