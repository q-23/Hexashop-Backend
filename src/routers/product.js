const express = require('express');
const Product = require('../models/product');
const multer = require('multer');
const router = new express.Router();

router.post('/product', async (req, res) => {
	const product = new Product(req.body);

	try {
		await product.save();
		res.status(201).send(product);
	} catch (e) {
		res.status(400).send({ error: 'Please provide all necessary product info.' })
	}
})

module.exports = router;