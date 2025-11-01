import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Addon from "./addonModel.js";

const Report = sequelize.define(
  "Report",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "resolved"),
      defaultValue: "open",
    },
  },
  {
    tableName: "reports",
  }
);

User.hasMany(Report, { foreignKey: "user_id", onDelete: "CASCADE" });
Report.belongsTo(User, { foreignKey: "user_id" });

Addon.hasMany(Report, { foreignKey: "addon_id", onDelete: "CASCADE" });
Report.belongsTo(Addon, { foreignKey: "addon_id" });

export default Report;
