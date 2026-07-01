import nodemailer from "nodemailer";

// Konfigurasi SMTP menggunakan Gmail gratis
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // Email Gmail Tokomu (contoh: tokoku@gmail.com)
    pass: process.env.SMTP_PASSWORD, // App Password dari akun Google
  },
});

interface EmailParams {
  to: string;
  orderId: string;
  customerName: string;
}

export async function sendPickupReadyEmail({
  to,
  orderId,
  customerName,
}: EmailParams) {
  try {
    const mailOptions = {
      from: `"BITEWORKS" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `📦 Pesanan #${orderId} Siap Diambil!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1e40af; margin-bottom: 16px;">Halo ${customerName},</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            Kabar baik! Pesanan Anda dengan nomor order <strong>#${orderId}</strong> saat ini telah selesai disiapkan oleh tim kami dan <strong>siap untuk diambil (Ready to Pickup)</strong> di offline store kami.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #1f2937;">📝 Yang Perlu Dibawa:</p>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #4b5563;">
              <li>Sebutkan ID Pesanan <strong>#${orderId}</strong> kepada staf store kami.</li>
              <li>Pastikan datang pada jam operasional store.</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Teria kasih telah berbelanja di toko kami!<br/>
            <strong>Team Admin Store</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return { success: false, error };
  }
}

// Tambahkan fungsi ini di dalam file src/lib/email.ts kamu

interface PickedUpEmailParams {
  to: string;
  orderId: string;
  customerName: string;
}

export async function sendOrderPickedUpEmail({
  to,
  orderId,
  customerName,
}: PickedUpEmailParams) {
  try {
    const mailOptions = {
      from: `"Nama Toko Kamu" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `🛍️ Pesanan #${orderId} Berhasil Diambil!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #16a34a; margin-bottom: 16px;">Terima Kasih, ${customerName}!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            Sesi pengambilan produk untuk nomor order <strong>#${orderId}</strong> telah berhasil dikonfirmasi oleh staf toko offline kami. Barang telah sukses diserahterimakan.
          </p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-weight: bold; color: #166534;">🎉 Detail Transaksi Selesai:</p>
            <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 14px;">
              Jika Anda tidak merasa mengambil pesanan ini atau mengalami kendala pada produk yang diterima, silakan hubungi Customer Service kami dengan melampirkan nomor order di atas.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Senang bisa melayani Anda. Sampai jumpa di orderan berikutnya!<br/>
            <strong>Team Admin Store</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Picked Up Error:", error);
    return { success: false, error };
  }
}
