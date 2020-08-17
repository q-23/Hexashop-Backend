const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth.js');

const Product = require('../models/product');
const Brand = require('../models/brand');
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

router.post('/brand', upload.single('brand_image'), auth('admin'), async (req, res) => {
    try {
        const brand_image = !!req.file ? await new Image(req.file.buffer) : null;
        const brand = await new Brand({ ...req.body, brand_image }).save();
        res.status(201).send(brand)
    } catch (e) {
        console.log(chalk.red('Error adding brand: ') + e);
        res.status(400).send({ error: e.toString() })
    }
});

router.get('/brand/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const brand = await Brand.findById(id);
        const products = await Product.find({ brand: id });

        const { brand_name } = brand;

        if (!brand) {
            res.status(404).send();
        }

        res.send({
            brand_name,
            products
        })
    } catch (e) {
        console.log(chalk.red('Error retrieving brand products: ') + e);
        res.status(500).send()
    }
});

router.get('/brand', async (req, res) => {
    try {
        const brands = await Brand.find({}, 'brand_name brand_path brand_image_link');
        res.status(200).send(brands);
    } catch (e) {
        console.log(chalk.red('Error retrieving brands: ') + e);
        res.status(500).send();
    }
});

router.delete('/brand/:id', auth('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const brand = await Brand.findByIdAndDelete(id);
        if (!brand) {
            res.status(404).send();
        }
        res.status(201).send();
    } catch (e) {
        console.log(chalk.red('Error deleting brand: ') + e);
        res.status(500).send();
    }
});

router.patch('/brand/:id', auth('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const brand = await Brand.findOneAndUpdate({ _id: id }, req.body, {
            new: true
        });

        if (!brand) {
            res.status(404).send();
        }

        res.status(201).send(brand);
    } catch (e) {
        console.log(chalk.red('Error updating brand: ') + e);
        res.status(500).send();
    }
})

module.exports = router;