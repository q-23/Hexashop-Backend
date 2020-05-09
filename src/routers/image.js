const express = require('express');
const router = new express.Router();

const Image = require('../models/image');

const chalk = require('chalk');

router.get('/image/:id', async (req, res) => {
    const id = req.params.id;
    const image = await Image.findById(id);
    if (!image) {
        return res.status(404).send()
    }

    try {
        res.set('Content-Type', 'image/png');
        res.send(image.image);
    } catch (e) {
        console.log(chalk.red('Error serving image: ') + e);
        res.send(500);
    }

})

module.exports = router;