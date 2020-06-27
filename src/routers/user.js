const express = require('express');
const router = new express.Router();

const User = require('../models/user');

const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js');

const { sendWelcomeEmail } = require('../emails/account');

router.post('/user/new', async (req, res) => {
	const user = new User(req.body);
	const token = await user.generateAuthToken();

	try {
		const { _id } = await user.save();
		await sendWelcomeEmail(user.email, user.name, user.generateVerificationToken(_id));
		res.status(201).send({ token, user });
	} catch (e) {
		res.status(400).send({ message: e.toString() });
	}
});

router.post('/user/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();

		res.status(200).send({ token, user })
	} catch (e) {
		res.status(400).send({ error: e.toString() })
	}
});

router.patch('/user', auth(), async (req, res) => {
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
		res.status(400).send({ error: e.toString() });
	}
});

router.get('/user/me', auth(), async (req, res) => {
	try {
		res.status(200).send(req.user);
	} catch (e) {
		res.status(500).send({ error: e.toString() })
	}
});

router.post('/user/logout', auth(), async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);

		await req.user.save();
		res.status(200).send()
	} catch (e) {
		res.status(400).send({ error: e.toString() })
	}
});

router.get('/user/verify/:token', async (req, res) => {
	const token = jwt.verify(req.params.token, process.env.JWT_SECRET)
	if (Date.now() >= token.exp * 1000) {
		return res.status(400).send({error: 'The link has expired.'})
	}
	try {
		const user = await User.findById(token._id);
		if (user.isVerified) {
			return res.status(403).send({ error: 'Your account is already verified.' })
		}
		await User.findByIdAndUpdate(token._id, { isVerified: true })
		res.status(200).send({ success: 'You have successfully verified your e-mail address.' })
	} catch (e) {
		res.status(400).send()
	}
});

module.exports = router;