const express = require('express');
const router = new express.Router();

const Purchase = require('../models/purchase');

const auth = require('../middleware/auth.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/purchase', auth(), async (req, res) => {
    const { amount, email } = req.body;

    try {
        const payment = await stripe.charges.create({
            amount: amount,
            currency: 'usd',
            source: 'tok_visa',
            receipt_email: email,
        });
        const { status, receipt_url, receipt_email, id } = payment;
        const purchase = new Purchase({ status, receipt_url, receipt_email, id, amount: payment.amount, customer_id: req.user._id })

        const purchaseSaved = await purchase.save();
        res.status(200).send(purchaseSaved);
    } catch (e) {
        res.status(e.raw.statusCode).send({ error: e.toString().replace('StripeInvalidRequestError: ', ''), code: e.raw.code })
    }
});

module.exports = router;