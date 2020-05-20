const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = (type = 'user') => async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

		if (!user) {
			throw new Error({ error: 'User not found.' })
		}

		if (type === 'admin' && !user.isAdmin) {
			return res.status(403).send({ error: 'You need administrative privileges to perform this action.' })
		}

		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.status(401).send({ error: 'Please authenticate.' })
	}
};

module.exports = auth;