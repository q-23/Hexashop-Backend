const express = require('express');
const router = new express.Router();

const { v4 } = require('uuid');

const Purchase = require('../models/purchase');
const Product = require('../models/product');

const auth = require('../middleware/auth.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { sendPurchaseSuccessEmail } = require('../emails/account');

router.post('/purchase', auth(), async (req, res) => {
    const { products, token } = req.body;
    const idempotencyKey = v4();

    const purchasedProducts = await Product
      .find({}, 'price name')
      .where('_id')
      .in(Object.keys(products));

    const totalPrice = purchasedProducts.reduce((accumulator, value) => {
        return accumulator += products[value._id] * value.price;
    }, 0) * 100;

    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });


        const charge = await stripe.charges.create({
            amount: totalPrice,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: 'Purchase',
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country,
                    city: token.card.address_city,
                    line1: token.card.address_line1,
                    postal_code: token.card.address_zip
                }
            }
        }, { idempotencyKey })

        const { status, receipt_url, receipt_email, id, shipping, } = charge;
        await new Purchase({ status, receipt_url, receipt_email, id, amount: totalPrice, customer_id: req.user._id, purchased_products: products, shipping }).save();

        const productsListForEmail = purchasedProducts.map(product => ({ ...product._doc, quantity: products[product._id] }));

        await sendPurchaseSuccessEmail({ email: req.user.email,  name: req.user.name, invoiceLink: receipt_url, products: productsListForEmail, totalPrice });
        res.status(200).send({ message: 'Purchase successful!' });
    } catch (e) {
        console.log(e)
        if (!e.raw) {
            return res.status(400).send({error: 'Invalid request'});
        }
        res.status(e.raw.statusCode).send({ error: e.toString().replace('StripeInvalidRequestError: ', ''), code: e.raw.code })
    }
});

router.get('/purchase/my_purchases', auth(), async (req, res) => {
    const { user } = req;
    try {
        const userPurchases = await Purchase.find({ customer_id: user._id }) ;
        res.status(200).send(userPurchases);
    } catch (e) {
        console.log(e);
        req.status(400).send({ error: "We couldn't retrieve your purchases." })
    }

})

module.exports = router;