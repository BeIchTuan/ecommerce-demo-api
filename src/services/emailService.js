const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendOrderConfirmationEmail = async (orderDetails, customerEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailHTML = generateOrderEmailHTML(orderDetails);

    const mailOptions = {
      from: {
        name: "GEEK UP",
        address: process.env.EMAIL_NAME,
      },
      to: customerEmail,
      subject: getEmailSubject(orderDetails.paymentStatus),
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

function getEmailSubject(paymentStatus) {
  switch (paymentStatus) {
    case "pending":
      return "Order is pending";
    case "paid":
      return "Order has been paid";
    default:
      return "Order Confirmation";
  }
}

function generateOrderEmailHTML(order) {
  const itemsHTML = order.items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
        index + 1
      }</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
        item.productName
      }</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
        ${item.size} - ${item.color}
      </td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.price.toLocaleString()} VND</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #4CAF50;">
        <h1 style="color: #4CAF50; font-size: 24px; margin-bottom: 5px;">Xác nhận đơn hàng</h1>
        <p style="font-size: 14px; color: #777;">Cảm ơn bạn đã mua sắm tại GEEK UP!</p>
      </div>

      <!-- Order Details -->
      <div style="margin-top: 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
        <h2 style="font-size: 18px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 8px; margin-bottom: 15px;">Chi tiết đơn hàng</h2>
        <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
        <p><strong>Ngày đặt hàng:</strong> ${new Date(order.orderDate).toLocaleString(
          "vi-VN"
        )}</p>
        <p><strong>Tổng tiền:</strong> <span style="color: #E91E63; font-weight: bold;">${order.totalAmount.toLocaleString()} VND</span></p>
        <p><strong>Phí vận chuyển:</strong> ${order.shippingFee.toLocaleString()} VND</p>
        <p><strong>Phương thức thanh toán:</strong> ${
          order.paymentMethod === "momo"
            ? "MoMo"
            : "Tiền mặt khi nhận hàng"
        }</p>
        <p><strong>Trạng thái thanh toán:</strong> <span style="color: ${
          order.paymentStatus === "paid" ? "#4CAF50" : "#FF9800"
        };">
          ${
            order.paymentStatus === "paid"
              ? "Đã thanh toán"
              : "Chờ thanh toán"
          }
        </span></p>
        <p><strong>Trạng thái đơn hàng:</strong> <span style="color: #FF9800;">
          ${
            order.shippingStatus === "pending"
              ? "Đang xử lý"
              : order.shippingStatus === "shipped"
              ? "Đang vận chuyển"
              : order.shippingStatus === "delivered"
              ? "Đã giao hàng"
              : "Đang xử lý"
          }
        </span></p>
      </div>

      <!-- Shipping Address -->
      <div style="margin-top: 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
        <h2 style="font-size: 18px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 8px; margin-bottom: 15px;">Địa chỉ giao hàng</h2>
        <p><strong>Địa chỉ:</strong> ${order.shippingAddress.address_detail}</p>
        <p><strong>Phường/Xã:</strong> ${order.shippingAddress.commune}</p>
        <p><strong>Quận/Huyện:</strong> ${order.shippingAddress.district}</p>
        <p><strong>Tỉnh/Thành phố:</strong> ${order.shippingAddress.province}</p>
        <p><strong>Loại nhà:</strong> ${order.shippingAddress.housing_type}</p>
      </div>

      <!-- Order Items -->
      <div style="margin-top: 20px;">
        <h2 style="font-size: 18px; color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 8px; margin-bottom: 15px;">Sản phẩm đã đặt</h2>
        <table style="width: 100%; border-collapse: collapse; background-color: #f9f9f9; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #4CAF50; color: #fff; text-align: center;">
              <th style="padding: 10px; border: 1px solid #ddd;">STT</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Tên sản phẩm</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Phân loại</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Số lượng</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 2px solid #ddd; margin-top: 20px;">
        <p style="font-size: 14px; color: #777;">Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng <a href="mailto:${
          process.env.EMAIL_NAME
        }" style="color: #4CAF50; text-decoration: none;">liên hệ với chúng tôi</a>.</p>
        <p style="font-size: 12px; color: #aaa;">&copy; 2024 GEEK UP. All rights reserved.</p>
      </div>
    </div>
  `;
}

module.exports = {
  sendOrderConfirmationEmail,
};
