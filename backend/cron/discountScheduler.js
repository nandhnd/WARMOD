import cron from "node-cron";
import Discount from "../models/discountModel.js";
import { Op } from "sequelize";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    // --- START DISCOUNT ---
    const start = await Discount.update(
      { status: "active" },
      {
        where: {
          status: "inactive",
          start_at: { [Op.lte]: now },
          end_at: { [Op.gt]: now },
        },
      }
    );

    // --- END DISCOUNT ---
    const end = await Discount.update(
      { status: "inactive" },
      {
        where: {
          status: "active",
          end_at: { [Op.lte]: now },
        },
      }
    );

    if (start[0] > 0 || end[0] > 0) {
      console.log(`[DISCOUNT CRON] Updated at: ${now.toISOString()}`);
      console.log(`Start Applied: ${start[0]} | End Applied: ${end[0]}`);
    }

    console.log("CRON running at", now.toISOString());
  } catch (error) {
    console.error("DISCOUNT CRON ERROR:", error);
  }
});
