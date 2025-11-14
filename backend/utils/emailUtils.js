import nodemailer from "nodemailer";

export const sendAddonEmail = async ({ to, username, addons, transaction }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const addonListHTML = addons
      .map(
        (addon) => `
            <tr>
                <td style="padding: 6px 0;">
                <b>${addon.name}</b><br/>
                <a href="${addon.link}" target="_blank">🔗 Download Addon</a>
                </td>
                <td style="padding: 6px 0; text-align: right;">
                Rp ${addon.price.toLocaleString()}
                </td>
            </tr>
        `
      )
      .join("");

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>🎉 Pembelian Addon Berhasil!</h2>
      <p>Halo <b>${username}</b>,</p>

      <p>Terima kasih telah melakukan pembelian addon di platform kami. Berikut detail transaksinya:</p>

      <h3>📄 Informasi Transaksi</h3>
      <p><b>Reference ID:</b> ${transaction.reference_id}</p>
      <p><b>Total Pembayaran:</b> Rp ${transaction.amount.toLocaleString()}</p>
      <p><b>Status:</b> <span style="color: green; font-weight: bold;">PAID</span></p>

      <h3>🧩 Addon yang Kamu Dapatkan</h3>
      <table width="100%" style="border-collapse: collapse;">
        ${addonListHTML}
      </table>

      <br/>
      <p>Silakan login ke website untuk mengakses addon yang sudah kamu beli.</p>

      <br/>
      <p>Salam hangat,<br/><b>WarMod Team</b></p>

      <hr/>
      <p style="font-size: 12px; color: #666;">
        Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
      </p>
    </div>
    `;

    await transporter.sendMail({
      from: `"WarMod" <${process.env.SMTP_USER}>`,
      to,
      subject: "Pembelian Addon Berhasil",
      html: htmlContent,
    });

    console.log("Email addon berhasil dikirim ke:", to);
  } catch (err) {
    console.error("sendAddonEmail error:", err.message);
  }
};
