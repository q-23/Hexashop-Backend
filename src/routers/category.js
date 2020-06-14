const express = require('express');
const router = new express.Router();

const Category = require('../models/category');
const Product = require('../models/product');

const chalk = require('chalk');

router.post('/category', async (req, res) => {
    try {
        const category = await new Category(req.body).save();

        res.status(201).send(category)
    } catch (e) {
        console.log(chalk.red('Error adding category: ') + e);
        res.status(400).send()
    }
});

router.get('/category/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findById(id);
        const products = await Product.find({ category: id });

        const { category_name } = category;

        if (!category) {
            res.status(404).send();
        }

        res.send({
            category_name,
            products
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

router.delete('/category/:id', async (req, res) => {
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

router.patch('/category/:id', async (req, res) => {
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