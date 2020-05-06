const express = require('express');
const router = new express.Router();

const Product = require('../models/product');
const multer = require('multer');

const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, callback) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return callback(new Error('Please upload a .jpg, .jpeg or .png file'))
		}
		callback(undefined, true)
	}
});

router.post('/product', upload.any(), async (req, res) => {
	const images = !!req.files ? req.files.map((image, index) => ({ image, ...req.body.images[index]})) : [];
	const product = new Product({...req.body, images});

	try {
		await product.save();
		res.status(201).send(product);
	} catch (e) {
		res.status(400).send({ error: 'Please provide all necessary product info.' })
	}
});

router.get('/product', async (req,res) => {
	try {
		const products = await Product
			.find({})
			.limit(Number(req.query.limit))
			.skip(Number(req.query.skip));

		res.send(products);
	} catch (e) {
		res.status(404).send(e)
	}
});

router.get('/product/:id', async (req,res) => {
	const _id = req.params.id;

	try {
		const product = await Product
			.findOne({ _id });

		if(!product) {
			return res.status(404).send();
		}

		res.send(product);
	} catch (e) {
		res.status(404).send(e)
	}
});

module.exports = router;