import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Discount = sequelize.define(
  "Discount",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "id",
      },
    },

    percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "inactive",
    },
  },
  {
    tableName: "discounts",
    timestamps: true,
    underscored: true,
  }
);

export default Discount;
