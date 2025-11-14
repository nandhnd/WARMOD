import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Store from "./storeModel.js";
import TransactionItem from "./transactionItemModel.js";

const Addon = sequelize.define(
  "Addon",
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
        model: Store,
        key: "id",
      },
      onDelete: "CASCADE",
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
    images: {
      type: DataTypes.JSON, // ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]
      allowNull: true,
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
    timestamps: true,
  }
);

Store.hasMany(Addon, { foreignKey: "store_id", as: "addons" });
z;
Addon.belongsTo(Store, { foreignKey: "store_id", as: "store" });

export default Addon;
