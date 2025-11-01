import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Store from "./storeModel.js";

const Addon = sequelize.define(
  "Addon",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING, // link Google Drive
      allowNull: false,
    },
    game: {
      type: DataTypes.STRING, // contoh: Euro Truck Simulator
      allowNull: false,
    },
    sold_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "addons",
  }
);

Store.hasMany(Addon, { foreignKey: "store_id", as: "addons" });
Addon.belongsTo(Store, { foreignKey: "store_id", as: "store" });

export default Addon;
