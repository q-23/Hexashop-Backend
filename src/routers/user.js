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
		const userData = req.user.toObject();
		delete userData.password;
		delete userData.tokens;
		res.status(200).send(userData);
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
	try {
		const token = jwt.verify(req.params.token, process.env.JWT_SECRET)
		const user = await User.findById(token._id);
		if (user.isVerified) {
			return res.status(403).send({ error: 'Your account is already verified. Go to login page to sign in to your account.'});
		}
		await User.findByIdAndUpdate(token._id, { isVerified: true })
		res.status(200).send({ success: 'Registration successful! Please check your e-mail and click the provided link to complete your registration. You can close this page.' })
	} catch (e) {
		console.log(e)
		res.status(400).send({error: 'Your link is malformed. Please enter a valid verification link and try again.'})
	}
});

module.exports = router;