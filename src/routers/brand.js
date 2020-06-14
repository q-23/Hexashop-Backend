const express = require('express');
const router = new express.Router();

const Product = require('../models/product');
const Brand = require('../models/brand');
const chalk = require('chalk');

router.post('/brand', async (req, res) => {
    try {
        const brand = await new Brand(req.body).save();

        res.status(201).send(brand)
    } catch (e) {
        console.log(chalk.red('Error adding brand: ') + e);
        res.status(400).send()
    }
});

router.get('/brand/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const brand = await Brand.findById(id);
        const products = await Product.find({ brand_name: id });

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
        const brands = await Brand.find();
        res.status(200).send(brands);
    } catch (e) {
        console.log(chalk.red('Error retrieving brands: ') + e);
        res.status(500).send();
    }
});

router.delete('/brand/:id', async (req, res) => {
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

router.patch('/brand/:id', async (req, res) => {
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