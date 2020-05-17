const express = require('express');
const router = new express.Router();

const Image = require('../models/image');

const chalk = require('chalk');

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

// router.patch('/image/:id', async (req, res) => {
//     const { id } = req.params;
//     const updateFields = Object.entries(req.body);
//     console.log('image patch req body', req.body)
//     try {
//         const imageEdited = await Image.findById(id, function (err, doc) {
//             if (err) { return err; }
//             updateFields.forEach(field => doc[field[0]] = field[1])
//             doc.save(res.status(200).send(doc));
//         });
//         if (!imageEdited) {
//             res.status(400).send();
//         }
//     } catch (e) {
//         res.status(500).send();
//         console.log(chalk.red('Error editing image: ') + e);
//     }
// });

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