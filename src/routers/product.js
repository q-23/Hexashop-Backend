const express = require('express');
const Product = require('../models/product');
const multer = require('multer');
const router = new express.Router();

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
})

module.exports = router;