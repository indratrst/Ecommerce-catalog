// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

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

    await transporter.sendMail(mailOptions);
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

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Picked Up Error:", error);
    return { success: false, error };
  }
}
