const express = require('express');
const router = new express.Router();

const Order = require('../models/order');

const auth = require('../middleware/auth.js');
const chalk = require('chalk');

router.post('/order/new', async (req, res) => {
    try {
        const order = await new Order(req.body).save();

        res.status(200).send(order)
    } catch (e) {
        console.log(chalk.red('Error adding category: ') + e);
        res.status(400).send()
    }
});

router.get('/order/my_orders', auth(), async (req, res) => {
    try {
        const orders = await Order.find({ customer_id:  req.user._id});

        res.status(200).send(orders)
    } catch (e) {
        res.status(400).send()
    }
});

module.exports = router;