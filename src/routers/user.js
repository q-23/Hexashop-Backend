const express = require('express');
const router = new express.Router();

const User = require('../models/user');
const auth = require('../middleware/auth.js');

const { sendWelcomeEmail } = require('../emails/account');

const chalk = require('chalk');

router.post('/user', async (req, res) => {
	const user = new User(req.body);
	const token = await user.generateAuthToken();

	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		res.status(201).send({ token, user });
	} catch(e) {
		res.status(400).send({message: e});
	}
});

router.post('/user/login', async (req, res) => {
    try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.status(200).send({ token, user })
	} catch (e) {
		res.status(400).send()
	}
});

router.patch('/user', auth, async (req,res) => {
	const updates = Object.keys(req.body);
	const notAllowedUpdatesArray = ['email'];
	const isValidOperation = !updates.every(el => notAllowedUpdatesArray.includes(el));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid operation!' });
	}

	try {
		const user = await User.findByIdAndUpdate(req.user._id, req.body);
		await user.save();
		res.send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.get('/user/me', auth, async (req, res) => {
	try {
		res.status(200).send(req.user);
	} catch (e) {
		console.log(e)
		res.status(500).send()
	}
})

module.exports = router;