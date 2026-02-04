const express = require('express');
const { chargeQris, webhookHandler, checkPaymentStatus } = require('../controllers/paymentController');
const router = express.Router();

router.post('/charge-qris', chargeQris);
router.post('/webhooks/midtrans', webhookHandler);
router.get('/status/:orderId', checkPaymentStatus);

module.exports = router;