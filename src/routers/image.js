const express = require('express');
const router = new express.Router();

const Image = require('../models/image');

const chalk = require('chalk');

router.get('/image/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const image = await Image.findById(id);

        if (!image) {
            return res.status(404).send()
        }
    
        res.set('Content-Type', 'image/png');
        res.send(image.image);
    } catch (e) {
        console.log(chalk.red('Error serving image: ') + e);
        res.send(500);
    }

});

router.delete('/image/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        await Image.findByIdAndDelete(id);
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
        console.log(chalk.red('Error deleting image: ') + e);
    }
})

module.exports = router;