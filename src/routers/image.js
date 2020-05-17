const express = require('express');
const router = new express.Router();

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

router.get('/image/:id', async (req, res) => {
    const { id } = req.params;

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

router.patch('/image/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const image = req.file.buffer;
    try {
        const imageEdited = await Image.findByIdAndUpdate(id, {...req.body, image}, {
            new: true
        });

        if (!imageEdited) {
            res.status(400).send();
        }
        res.status(200).send(imageEdited);
    } catch (e) {
        res.status(500).send();
        console.log(chalk.red('Error editing image: ') + e);
    }
});

router.delete('/image/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Image.findByIdAndDelete(id);
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
        console.log(chalk.red('Error deleting image: ') + e);
    }
});

module.exports = router;