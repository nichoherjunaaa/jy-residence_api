const midtransClient = require('midtrans-client');
const Booking = require('../models/Booking');
const coreApi = require('../config/midtrans');

const chargeQris = async (req, res) => {
    try {
        let parameter = {
            "payment_type": "gopay",
            "transaction_details": {
                "order_id": req.body.orderId || "JYRES-" + Date.now(),
                "gross_amount": parseInt(req.body.amount)
            },
            "customer_details": {
                "first_name": req.body.firstName,
                "email": req.body.email
            }
        };
        const response = await coreApi.charge(parameter);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const webhookHandler = async (req, res) => {
    const notificationJson = req.body;
    const statusResponse = await coreApi.transaction.notification(notificationJson);

    const { order_id, transaction_status } = statusResponse;

    let updateData = {};

    // Di dalam webhookHandler
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
        if (statusResponse.fraud_status === 'accept') {
            updateData = { status: "PAID", paymentStatus: "SUCCESS" };
        }
    } else if (transaction_status === 'expire') {
        updateData = { status: "EXPIRED", paymentStatus: "FAILED" };
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
        updateData = { status: "CANCELLED", paymentStatus: "FAILED" };
    }

    if (Object.keys(updateData).length > 0) {
        await Booking.findOneAndUpdate({ orderId: order_id }, updateData);
        console.log(`Booking ${order_id} updated to ${updateData.status}`);
    }

    res.status(200).send('OK');
};

const checkPaymentStatus = async (req, res) => {
    try {
        const booking = await Booking.findOne({ orderId: req.params.orderId })
            .select('status paymentStatus'); // Ambil yang perlu saja

        if (!booking) {
            return res.status(404).json({ success: false, message: "Not Found" });
        }

        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { chargeQris, webhookHandler, checkPaymentStatus };