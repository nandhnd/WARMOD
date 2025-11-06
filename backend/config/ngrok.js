// config/ngrok.js
import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";
dotenv.config();

export const startNgrok = async (port) => {
  try {
    const listener = await ngrok.connect({
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN,
      region: "ap", // Asia Pacific
      proto: "http",
    });

    const url = listener.url();
    console.log("🚀 Ngrok tunnel aktif di:", url);
    console.log(
      `🌐 Webhook URL (Midtrans): ${url}/api/transactions/webhook/midtrans`
    );

    return url;
  } catch (error) {
    console.error("❌ Gagal menjalankan ngrok:", error);
  }
};
