const express = require('express');
const router = new express.Router();

const User = require('../models/user');

const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js');
const moment = require('moment');
const bcrypt = require('bcrypt');

const { sendWelcomeEmail, sendPasswordChangeEmail } = require('../emails/account');

router.post('/user/new', async (req, res) => {
	const user = new User(req.body);
	await user.generateAuthToken();

	try {
		const { _id } = await user.save();
		await sendWelcomeEmail(user.email, user.name, user.generateVerificationToken(_id));
		res.status(201).send({ message: 'Your account was created successfully. Please confirm your e-mail.' });
	} catch (e) {
		res.status(400).send({ error: e.toString() });
	}
});

router.post('/user/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();

		res.status(200).send({ token, isAdmin: user.isAdmin })
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
		const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
		await user.save();
		res.send({ message: 'Account edited successfully' });
	} catch (e) {
		console.log(e)
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
		res.status(200).send({ message: 'Registration successful! Please check your e-mail and click the provided link to complete your registration. You can close this page.' })
	} catch (e) {
		console.log(e)
		res.status(400).send({ error: 'Your link is malformed. Please enter a valid verification link and try again.'})
	}
});

router.get('/user/reset_password/:token', async (req, res) => {
	const { token } = req.params;
	try {
		const tokenContent = jwt.verify(token, process.env.JWT_SECRET);
		if (!tokenContent || !tokenContent._id || tokenContent.type !== 'passwordChange') {
			return res.status(500).send({ error: 'Wrong verification link.' })
		}
		const user = await User.findOne({ 'password_change_tokens.token': token });
		const userObject = await user.toObject();
		const currentToken = userObject.password_change_tokens.find(element => element.token === token);
		if (currentToken.password_changed_date !== 'pending') {
			res.status(500).send({ error: 'Your password has already been changed.' });
		}
		res.status(200).send();
	} catch (e) {
		res.status(500).send({ error: e.toString() });
	}
});

router.get('/user/reset_password', async (req, res) => {
	const { email } = req.query;
	try {
		const user = await User.findOne({ email });
		const userObject = await user.toObject();
		const isTokenAlreadyGenerated = userObject.password_change_tokens.some(token => token.password_changed_date === 'pending');
		if(isTokenAlreadyGenerated) {
			return res.status(400).send({ error: 'Password reset link already generated! Please check your e-mail.' });
		}
		if(!user) {
			return res.status(200).send()
		}
		const passwordChangeToken = await user.generatePasswordChangeToken(user._id);
		await sendPasswordChangeEmail({ email, passwordChangeToken });
		return res.status(200).send({ message: 'Password reset link sent. Please check your inbox.' });
	} catch (e) {
		res.status(500).send();
	}
});

router.patch('/user/reset_password', async (req, res) => {
	const token = req.header('Authorization').replace('Bearer ', '');
	const { password } = req.body;
	try {
		const user = await User.findOneAndUpdate({ 'password_change_tokens.token': token }, {
			password: await bcrypt.hash(password, 8), $set: {
				'password_change_tokens.$.password_changed_date': moment().format()
			}
		});
		await user.save();
		res.status(200).send({ message: 'Password changed successfully. You can log in now using your new password.' });
	} catch (e) {
		res.status(500).send();
	}
});

module.exports = router;