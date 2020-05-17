const express = require('express');
const router = new express.Router();

const User = require('../models/user');

const chalk = require('chalk');

router.post('/user', async (req, res) => {
    const user = new User(req.body);
	const token = await user.generateAuthToken();

	try {
		await user.save();
		res.status(201).send({ token, user });
	} catch(e) {
        console.log(chalk.red('Error adding new user: ') + e);
		res.status(400).send(e);
	}
});

module.exports = router;