import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DiscountItem = sequelize.define(
  "DiscountItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    discount_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    addon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "discount_items",
    timestamps: true,
    underscored: true,
  }
);

export default DiscountItem;
