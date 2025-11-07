import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Addon from "./addonModel.js";

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
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    addon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Addon,
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

// 🔗 Relasi antar model
User.hasMany(Cart, { foreignKey: "user_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Addon.hasMany(Cart, { foreignKey: "addon_id" });
Cart.belongsTo(Addon, { foreignKey: "addon_id" });

export default Cart;
