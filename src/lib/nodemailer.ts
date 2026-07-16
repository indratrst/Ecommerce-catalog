import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

transporter.verify().then(
  () => {
    console.log("[Nodemailer] SMTP transporter verified successfully.");
  },
  (err) => {
    console.error("[Nodemailer] SMTP transporter verification failed:", err);
  },
);

function logEmailDebug(name: string, options: { from: string; to: string; subject: string }) {
  console.log("[Nodemailer] Sending email:", {
    type: name,
    from: options.from,
    to: options.to,
    subject: options.subject,
    smtpUser: smtpUser ? "SET" : "EMPTY",
    smtpPass: smtpPass ? "SET" : "EMPTY",
  });
}


interface ProductDetail {
  title: string;
  image: string | null;
}

interface ProductVariant {
  size: string | null;
  color: string | null;
  product: ProductDetail;
}

interface OrderItem {
  quantity: number;
  priceAtPurchase: number;
  productVariant: ProductVariant;
}

interface EmailParams {
  to: string;
  orderId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
}

interface ShippingEmailParams extends EmailParams {
  trackingNumber: string | null;
}

function generateItemsTable(items: OrderItem[]): string {
  return items
    .map((item) => {
      const product = item.productVariant.product;
      const variant = item.productVariant;
      const variantText =
        [variant.size, variant.color].filter(Boolean).join(", ") || "-";
      const imageUrl = product.image || "https://via.placeholder.com/150";

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; width: 60px; vertical-align: top;">
            <img src="${imageUrl}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;" />
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; padding-left: 12px;">
            <p style="margin: 0; font-weight: bold; color: #1f2937; font-size: 14px;">${product.title}</p>
            <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 12px;">Variasi: ${variantText}</p>
            <p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">${item.quantity}x x Rp ${item.priceAtPurchase.toLocaleString("id-ID")}</p>
          </td>
          <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f3f4f6; color: #1f2937; font-weight: 500; font-size: 14px; vertical-align: top;">
            Rp ${(item.quantity * item.priceAtPurchase).toLocaleString("id-ID")}
          </td>
        </tr>
      `;
    })
    .join("");
}

export async function sendPickupReadyEmail({
  to,
  orderId,
  customerName,
  items,
  totalAmount,
}: EmailParams): Promise<{ success: boolean; error?: unknown }> {
  try {
    const mailOptions = {
      from: `"BITEWORKS" <${process.env.SMTP_USER}>`,
      to,
      subject: `📦 Pesanan #${orderId} Siap Diambil!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #374151;">
          <h2 style="color: #1e40af; margin-bottom: 16px; font-size: 20px;">Halo ${customerName},</h2>
          <p style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
            Kabar baik! Pesanan Anda dengan nomor order <strong>#${orderId}</strong> telah selesai disiapkan dan <strong>siap untuk diambil (Ready to Pickup)</strong> di offline store kami.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0; font-weight: bold; color: #1f2937;">📝 Yang Perlu Dibawa:</p>
            <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.4;">
              <li>Sebutkan ID Pesanan <strong>#${orderId}</strong> kepada staf store kami.</li>
              <li>Pastikan datang pada jam operasional store.</li>
            </ul>
          </div>

          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-weight: bold; color: #1f2937; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Detail Produk</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${generateItemsTable(items)}
            </table>
            <table style="width: 100%; margin-top: 12px;">
              <tr>
                <td style="font-weight: bold; color: #1f2937; font-size: 15px;">Total Pembayaran</td>
                <td style="text-align: right; font-weight: bold; color: #1e40af; font-size: 16px;">Rp ${totalAmount.toLocaleString("id-ID")}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Terima kasih telah berbelanja di toko kami!<br/>
            <strong>Team Admin BITEWORKS</strong>
          </p>
        </div>
      `,
    };

    logEmailDebug("PickupReadyEmail", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("[Nodemailer] PickupReadyEmail sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return { success: false, error };
  }
}

export async function sendOrderPickedUpEmail({
  to,
  orderId,
  customerName,
  items,
  totalAmount,
}: EmailParams): Promise<{ success: boolean; error?: unknown }> {
  try {
    const mailOptions = {
      from: `"BITEWORKS" <${process.env.SMTP_USER}>`,
      to,
      subject: `🛍️ Pesanan #${orderId} Berhasil Diambil!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #374151;">
          <h2 style="color: #16a34a; margin-bottom: 16px; font-size: 20px;">Terima Kasih, ${customerName}!</h2>
          <p style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
            Sesi pengambilan produk untuk nomor order <strong>#${orderId}</strong> telah berhasil dikonfirmasi oleh staf toko offline kami. Barang telah sukses diserahterimakan.
          </p>

          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-weight: bold; color: #1f2937; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Detail Produk Yang Diambil</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${generateItemsTable(items)}
            </table>
            <table style="width: 100%; margin-top: 12px;">
              <tr>
                <td style="font-weight: bold; color: #1f2937; font-size: 15px;">Total Pembayaran</td>
                <td style="text-align: right; font-weight: bold; color: #16a34a; font-size: 16px;">Rp ${totalAmount.toLocaleString("id-ID")}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fdf2f8; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fbcfe8;">
            <p style="margin: 0; font-weight: bold; color: #9d174d;">🎉 Detail Transaksi Selesai:</p>
            <p style="margin: 5px 0 0 0; color: #4c0519; font-size: 14px; line-height: 1.4;">
              Jika Anda tidak merasa mengambil pesanan ini atau mengalami kendala pada produk yang diterima, silakan hubungi Customer Service kami dengan melampirkan nomor order di atas.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Senang bisa melayani Anda. Sampai jumpa di orderan berikutnya!<br/>
            <strong>Team Admin BITEWORKS</strong>
          </p>
        </div>
      `,
    };

    logEmailDebug("OrderPickedUpEmail", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("[Nodemailer] OrderPickedUpEmail sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Picked Up Error:", error);
    return { success: false, error };
  }
}

export async function sendShippingEmail({
  to,
  orderId,
  customerName,
  items,
  totalAmount,
  trackingNumber,
}: ShippingEmailParams): Promise<{ success: boolean; error?: unknown }> {
  try {
    const mailOptions = {
      from: `"BITEWORKS" <${process.env.SMTP_USER}>`,
      to,
      subject: `🚚 Pesanan #${orderId} Telah Dikirim - Nomor Resi ${trackingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #374151;">
          <h2 style="color: #1e40af; margin-bottom: 16px; font-size: 20px;">Halo ${customerName},</h2>
          <p style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
            Kabar baik! Pesanan Anda dengan nomor order <strong>#${orderId}</strong> telah diterima dan sedang dalam proses pengiriman. Anda dapat melacak paket Anda menggunakan nomor resi di bawah ini.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 24px; border-left: 4px solid #1e40af;">
            <p style="margin: 0; font-weight: bold; color: #1f2937; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">📍 Nomor Resi Pengiriman</p>
            <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: bold; color: #1e40af; font-family: monospace; letter-spacing: 2px;">
              ${trackingNumber}
            </p>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
              Simpan nomor resi ini untuk melacak paket Anda
            </p>
          </div>

          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-weight: bold; color: #1f2937; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Detail Pesanan</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${generateItemsTable(items)}
            </table>
            <table style="width: 100%; margin-top: 12px;">
              <tr>
                <td style="font-weight: bold; color: #1f2937; font-size: 15px;">Total Pembayaran</td>
                <td style="text-align: right; font-weight: bold; color: #1e40af; font-size: 16px;">Rp ${totalAmount.toLocaleString("id-ID")}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 24px; border: 1px solid #bfdbfe;">
            <p style="margin: 0; font-weight: bold; color: #1e40af;">ℹ️ Informasi Pengiriman:</p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
              <li>Paket akan tiba dalam 2-7 hari kerja tergantung lokasi</li>
              <li>Anda dapat melacak paket menggunakan nomor resi di atas</li>
              <li>Pastikan seseorang berada di lokasi pengiriman saat paket tiba</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Terima kasih telah berbelanja di toko kami!<br/>
            Jika ada pertanyaan, jangan ragu untuk menghubungi Customer Service kami.<br/>
            <strong>Team Admin BITEWORKS</strong>
          </p>
        </div>
      `,
    };

    logEmailDebug("ShippingEmail", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("[Nodemailer] ShippingEmail sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Shipping Error:", error);
    return { success: false, error };
  }
}
