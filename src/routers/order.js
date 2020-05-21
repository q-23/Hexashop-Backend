const express = require('express');
const router = new express.Router();

const Order = require('../models/order');

const auth = require('../middleware/auth.js');

router.post('/order/new', auth(), async (req, res) => {
    try {
        const order = await new Order(req.body).save();

        res.status(200).send(order)
    } catch (e) {
        res.status(400).send()
    }
});

router.get('/order/my_orders', auth(), async (req, res) => {
    try {
        const orders = await Order
            .find({ customer_id: req.user._id })
            .limit(Number(req.query.limit))
            .skip(Number(req.query.skip));

        res.status(200).send(orders)
    } catch (e) {
        res.status(400).send()
    }
});

router.get('/order/all_orders', auth('admin'), async (req, res) => {
    try {
        const orders = await Order
            .find()
            .limit(Number(req.query.limit))
            .skip(Number(req.query.skip));

        res.status(200).send(orders)
    } catch (e) {
        res.status(400).send()
    }
});

router.get('/order/all_orders/:id', auth('admin'), async (req, res) => {
    try {
        const orders = await Order
            .find({ customer_id: req.params.id })
            .limit(Number(req.query.limit))
            .skip(Number(req.query.skip));

        res.status(200).send(orders)
    } catch (e) {
        res.status(400).send()
    }
});

module.exports = router;