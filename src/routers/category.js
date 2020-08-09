const express = require('express');
const router = new express.Router();

const Category = require('../models/category');
const Product = require('../models/product');

const auth = require('../middleware/auth.js');

const chalk = require('chalk');

router.post('/category', auth('admin'), async (req, res) => {
    try {
        const category = await new Category(req.body).save();
        res.status(201).send(category)
    } catch (e) {
        console.log(chalk.red('Error adding category: ') + e);
        res.status(400).send({ error: e.message })
    }
});

router.get('/category/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        const count = await Product.countDocuments({ category: id });
        const products = await Product
          .find({ category: id })
          .populate('image_thumbnail', 'link')
          .limit(Number(req.query.limit))
          .skip(Number(req.query.skip))
          .exec();

        // console.log(products)

        const { category_name } = category;

        if (!category) {
            res.status(404).send();
        }

        res.send({
            category_name,
            products,
            count
        })
    } catch (e) {
        console.log(chalk.red('Error retrieving category products: ') + e);
        res.status(500).send()
    }
});

router.get('/category', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch (e) {
        console.log(chalk.red('Error retrieving categories: ') + e);
        res.status(500).send();
    }
});

router.delete('/category/:id', auth('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            res.status(404).send();
        }
        res.status(201).send();
    } catch (e) {
        console.log(chalk.red('Error deleting category: ') + e);
        res.status(500).send();
    }
});

router.patch('/category/:id', auth('admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findOneAndUpdate({ _id: id }, req.body, {
            new: true
        });

        if (!category) {
            res.status(404).send();
        };

        res.status(201).send(category);
    } catch (e) {
        console.log(chalk.red('Error updating category: ') + e);
        res.status(500).send();
    }
})

module.exports = router;