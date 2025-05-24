const { sendOrderConfirmationEmail } = require('./emailService');

// Simulated payment processing
const processPayment = async (paymentDetails, payment_method, totalAmount) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (payment_method === 'momo') {
                if (paymentDetails?.transactionId && paymentDetails?.phoneNumber) {
                    resolve(true);
                } else {
                    reject(new Error('Invalid MoMo payment details'));
                }
            } else if (payment_method === 'cash') {
                resolve(true);
            } else {
                reject(new Error('Invalid payment method'));
            }
        }, 1000);
    });
};

async function createOrder(db, { userId, shippingAddress, items, voucherCodes = [], paymentDetails, shipping_fee, payment_method }) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Verify user exists
        const userResult = await client.query(
            'SELECT email FROM users WHERE id = $1',
            [userId]
        );
        if (userResult.rowCount === 0) {
            throw new Error('User not found');
        }

        // 2. Calculate total amount and verify product variants
        let totalAmount = 0;
        const variantChecks = [];

        for (const item of items) {
            const variantResult = await client.query(
                'SELECT pv.id, pv.price, pv.quantity, p.store_id FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.id = $1 FOR UPDATE',
                [item.productVariantId]
            );

            if (variantResult.rowCount === 0) {
                throw new Error(`Product variant ${item.productVariantId} not found`);
            }

            const variant = variantResult.rows[0];
            if (variant.quantity < item.quantity) {
                throw new Error(`Insufficient quantity for product variant ${item.productVariantId}`);
            }

            totalAmount += variant.price * item.quantity;
            variantChecks.push({
                id: variant.id,
                quantity: item.quantity,
                price: variant.price
            });
        }

        // 3. Apply vouchers if any
        let discountAmount = 0;
        if (voucherCodes.length > 0) {
            const voucherResult = await client.query(
                'SELECT v.id, v.discount_percent FROM vouchers v WHERE v.code = ANY($1) AND v.expiration_date >= CURRENT_DATE',
                [voucherCodes]
            );

            for (const voucher of voucherResult.rows) {
                // Verify user has access to the voucher
                const userVoucherResult = await client.query(
                    'SELECT 1 FROM user_vouchers WHERE user_id = $1 AND voucher_id = $2',
                    [userId, voucher.id]
                );

                if (userVoucherResult.rowCount === 0) {
                    throw new Error(`Voucher not available for user`);
                }

                discountAmount += (totalAmount * voucher.discount_percent) / 100;
            }
        }

        // 4. Calculate final amount
        totalAmount = totalAmount - discountAmount + shipping_fee;

        // 5. Process payment
        const payment_status = payment_method === 'momo' ? 'paid' : 'pending';
        if (payment_method === 'momo') {
            await processPayment(paymentDetails, payment_method, totalAmount);
        }

        // 6. Create order
        const orderResult = await client.query(
            `INSERT INTO orders (
        user_id,
        shipping_address,
        total_amount,
        shipping_fee,
        payment_method,
        payment_status,
        shipping_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, order_date, total_amount, shipping_fee, payment_method, payment_status, shipping_status`,
            [
                userId,
                JSON.stringify(shippingAddress),
                totalAmount,
                shipping_fee,
                payment_method,
                payment_status,
                'pending'
            ]
        );

        const order = orderResult.rows[0];

        // 7. Create order items and update inventory
        for (const variant of variantChecks) {
            // Create order item
            await client.query(
                'INSERT INTO order_items (order_id, product_variant_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order.id, variant.id, variant.quantity, variant.price]
            );

            // Update inventory
            await client.query(
                'UPDATE product_variants SET quantity = quantity - $1 WHERE id = $2',
                [variant.quantity, variant.id]
            );
        }

        // 8. Link vouchers to order if any were used
        if (voucherCodes.length > 0) {
            const usedVouchers = await client.query(
                'SELECT id FROM vouchers WHERE code = ANY($1)',
                [voucherCodes]
            );

            for (const voucher of usedVouchers.rows) {
                await client.query(
                    'INSERT INTO order_vouchers (order_id, voucher_id) VALUES ($1, $2)',
                    [order.id, voucher.id]
                );
            }
        } await client.query('COMMIT');

        // Get order items details for email
        const itemsDetails = await Promise.all(variantChecks.map(async (variant) => {
            const result = await client.query(
                `SELECT p.name, pv.size, pv.color 
         FROM product_variants pv 
         JOIN products p ON p.id = pv.product_id 
         WHERE pv.id = $1`,
                [variant.id]
            );
            const productInfo = result.rows[0];
            return {
                productName: productInfo.name,
                size: productInfo.size,
                color: productInfo.color,
                quantity: variant.quantity,
                price: variant.price
            };
        }));

        const orderDetails = {
            id: order.id,
            orderDate: order.order_date,
            totalAmount: order.total_amount,
            shippingFee: order.shipping_fee,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            shippingStatus: order.shipping_status,
            shippingAddress: shippingAddress,
            items: itemsDetails
        };

        // Send confirmation email asynchronously
        sendOrderConfirmationEmail(orderDetails, userResult.rows[0].email).catch((err) => {
            console.error(`Failed to send email for order ${order.id}:`, err);
        });

        return {
            id: order.id,
            orderDate: order.order_date,
            totalAmount: order.total_amount,
            shippingFee: order.shipping_fee,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            shippingStatus: order.shipping_status
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    createOrder
};