import sequelize from "../config/database.js";
import "./userModel.js";
import "./storeModel.js";
import "./addonModel.js";
import "./transactionModel.js";
import "./reportModel.js";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // gunakan { force: true } jika ingin reset total
    console.log("✅ All models synchronized successfully!");
  } catch (error) {
    console.error("❌ Failed to sync models:", error);
  }
};

export default syncDatabase;
