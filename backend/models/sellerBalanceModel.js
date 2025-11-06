import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Store from "./storeModel.js";

const SellerBalance = sequelize.define(
  "SellerBalance",
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
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("credit", "debit"), // credit = masuk, debit = keluar
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "seller_balances",
    timestamps: true,
  }
);

Store.hasMany(SellerBalance, {
  foreignKey: "store_id",
  as: "balances",
  onDelete: "CASCADE",
});
SellerBalance.belongsTo(Store, { foreignKey: "store_id", as: "store" });

export default SellerBalance;
