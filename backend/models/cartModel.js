import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cart = sequelize.define(
  "Cart",
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
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    addon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "addons",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "carts",
    timestamps: true,
  }
);

export default Cart;
