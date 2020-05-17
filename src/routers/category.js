const express = require('express');
const router = new express.Router();

const Category = require('../models/category');
const Product = require('../models/product');

const chalk = require('chalk');

router.post('/category', async (req, res) => {
    try {
        const category = await new Category(req.body).save();
    
        res.status(201).send(category)
    } catch(e) {
        console.log(chalk.red('Error adding category: ') + e);
        res.status(400).send()
    }
});

router.get('/category/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const {category_name} = await Category.findById(id);
        const products = await Product.find({category: id});

        res.send({ 
            category_name,
            products
        })
    } catch (e) {
        console.log(chalk.red('Error retrieving category products: ') + e);
        res.status(500).send()
    }
})

module.exports = router;