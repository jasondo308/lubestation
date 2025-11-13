import { Resend } from 'resend';
import { OrderData } from './googleSheets';

const resend = new Resend(process.env.RESEND_API_KEY);

// Format VND currency
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(orderData: OrderData, orderId: string) {
  try {
    const itemsHtml = orderData.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.size}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatVND(item.price)} ₫</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatVND(item.price * item.quantity)} ₫</td>
        </tr>
      `)
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            .table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 10px; padding-top: 10px; border-top: 2px solid #2563eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">LubeStation</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">powered by TheGioiRubik</p>
            </div>

            <div class="content">
              <h2 style="color: #2563eb; margin-top: 0;">Xác Nhận Đơn Hàng</h2>
              <p>Xin chào <strong>${orderData.full_name}</strong>,</p>
              <p>Cảm ơn bạn đã đặt hàng tại LubeStation! Chúng tôi đã nhận được đơn hàng của bạn và sẽ liên hệ sớm để xác nhận.</p>

              <div class="order-info">
                <h3 style="margin-top: 0; color: #1f2937;">Thông Tin Đơn Hàng</h3>
                <p><strong>Mã đơn hàng:</strong> ${orderId}</p>
                <p><strong>Email:</strong> ${orderData.email}</p>
                <p><strong>Số điện thoại:</strong> ${orderData.phone}</p>
                <p><strong>Địa chỉ giao hàng:</strong><br>${orderData.address}, ${orderData.city}</p>
                ${orderData.notes ? `<p><strong>Ghi chú:</strong> ${orderData.notes}</p>` : ''}
              </div>

              <h3 style="color: #1f2937;">Chi Tiết Sản Phẩm</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">Kích thước</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: right;">Đơn giá</th>
                    <th style="text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="summary">
                <div class="summary-row">
                  <span>Tạm tính:</span>
                  <span>${formatVND(orderData.subtotal)} ₫</span>
                </div>
                <div class="summary-row">
                  <span>Giảm giá (10% đặt trước):</span>
                  <span style="color: #059669;">-${formatVND(orderData.discount)} ₫</span>
                </div>
                <div class="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>${formatVND(orderData.shipping)} ₫</span>
                </div>
                <div class="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>${formatVND(orderData.total)} ₫</span>
                </div>
              </div>

              <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <strong>Lưu ý:</strong> Đây là đơn đặt hàng trước. Chúng tôi sẽ liên hệ với bạn để xác nhận và thông báo thời gian giao hàng dự kiến.
              </p>
            </div>

            <div class="footer">
              <p><strong>LubeStation</strong> - powered by TheGioiRubik</p>
              <p>© 2024 LubeStation. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to customer
    const customerEmail = await resend.emails.send({
      from: 'LubeStation <onboarding@resend.dev>', // Use your verified domain once set up
      to: orderData.email,
      subject: `✓ Xác nhận đơn hàng #${orderId} - LubeStation`,
      html: emailHtml,
    });

    console.log('Customer email sent:', customerEmail.id);

    return { success: true, emailId: customerEmail.id };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}

/**
 * Send order notification to admin/shop owner
 */
export async function sendAdminNotificationEmail(orderData: OrderData, orderId: string) {
  try {
    const itemsText = orderData.items
      .map(item => `${item.productName} (${item.size}) x${item.quantity} = ${formatVND(item.price * item.quantity)} ₫`)
      .join('\n');

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔔 Đơn Hàng Mới!</h1>
            </div>

            <div class="content">
              <h2 style="color: #dc2626;">Đơn hàng mới từ LubeStation</h2>

              <div class="info-box">
                <h3 style="margin-top: 0;">Thông tin khách hàng</h3>
                <p><strong>Mã đơn:</strong> ${orderId}</p>
                <p><strong>Tên:</strong> ${orderData.full_name}</p>
                <p><strong>Email:</strong> ${orderData.email}</p>
                <p><strong>SĐT:</strong> ${orderData.phone}</p>
                <p><strong>Địa chỉ:</strong> ${orderData.address}, ${orderData.city}</p>
                ${orderData.notes ? `<p><strong>Ghi chú:</strong> ${orderData.notes}</p>` : ''}
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">Sản phẩm</h3>
                <pre style="white-space: pre-wrap; font-family: monospace;">${itemsText}</pre>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0;">Tổng kết</h3>
                <p>Tạm tính: ${formatVND(orderData.subtotal)} ₫</p>
                <p>Giảm giá: -${formatVND(orderData.discount)} ₫</p>
                <p>Vận chuyển: ${formatVND(orderData.shipping)} ₫</p>
                <p style="font-size: 18px; font-weight: bold; color: #dc2626;">TỔNG: ${formatVND(orderData.total)} ₫</p>
              </div>

              <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 4px;">
                ⚡ Hãy liên hệ với khách hàng sớm để xác nhận đơn hàng!
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to admin (use your admin email)
    const adminEmail = await resend.emails.send({
      from: 'LubeStation <onboarding@resend.dev>',
      to: 'atg.toan@gmail.com', // Admin email
      subject: `🔔 Đơn hàng mới #${orderId} - ${orderData.full_name}`,
      html: adminEmailHtml,
    });

    console.log('Admin notification email sent:', adminEmail.id);

    return { success: true, emailId: adminEmail.id };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
}
