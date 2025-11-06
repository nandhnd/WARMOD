// config/midtrans.js
import midtransClient from "midtrans-client";

export const midtrans = new midtransClient.CoreApi({
  isProduction: false, // Ubah ke true kalau sudah live
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});
