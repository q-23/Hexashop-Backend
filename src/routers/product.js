const express = require('express');
const router = new express.Router();

const Product = require('../models/product');
const Image = require('../models/image');

const multer = require('multer');
const chalk = require('chalk');


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
	const { images, ...productData } = req.body;
	const imagesData = (!!req.files ? req.files.map((img, index) => ({ image: img.buffer, ...images[index] })) : []);

	const mainImageCount = !!imagesData && imagesData.filter(el => !!el.main).length;

	try {
		if (imagesData.length && mainImageCount !== 1) {
			throw new Error('If providing images, there must be exactly one with main flag.')
		}

		const img_data = imagesData.map(async el => await new Image(el).save());
		const result = await Promise.all(img_data);
		const image_ids = result.map(({ _id }) => _id);
		const product = new Product({ ...productData, images: image_ids });

		await product.save();
		res.status(201).send(product);
	} catch (e) {
		res.status(400).send(e)
	}
});

router.get('/product', async (req, res) => {
	const sort = {};

	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}

	try {
		const products = await Product
			.find()
			.select('name description price image_thumbnail')
			.limit(Number(req.query.limit))
			.skip(Number(req.query.skip))
			.sort(sort);

		res.send(products);
	} catch (e) {
		res.status(404).send(e)
	}
});

router.get('/product/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const product = await Product
			.findOne({ _id })
			.populate('category')
			.populate('images');

		res.status(200).send(product)
	} catch (e) {
		console.log(chalk.red('Error: ') + e)
		res.status(404).send()
	}
});

router.delete('/product/:id', async (req, res) => {
	const _id = req.params.id;

	try {
		const product = await Product
			.findOneAndDelete({ _id });

		if (!product) {
			return res.status(404).send();
		}

		res.send(product);
	} catch (e) {
		res.status(500).send(e)
	}
});

router.delete('/product', async (req, res) => {
	try {
		await Product.deleteMany({ _id: req.body });
		res.status(200).send();
	} catch (e) {
		console.log(chalk.red('Error deleting files: ') + e);
		res.status(500).send();
	}
});

router.patch(`/product/:id`, async (req, res) => {
	const { id } = req.params;

	try {
		const product = await Product.findByIdAndUpdate({ _id: id }, req.body);
		if (!product) {
			return res.status(400).send();
		}
		res.status(200).send(product);
	} catch (e) {
		res.status(500).send();
		console.log(chalk.red('Error updating product: ') + e);
	}
});

module.exports = router;