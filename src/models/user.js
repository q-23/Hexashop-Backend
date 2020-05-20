const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	surname: {
		type: String,
		required: true,
		trim: true
	},
	city: {
		type: String,
		required: true,
		trim: true
	},
	street: {
		type: String,
		required: true,
		trim: true
	},
	house_number: {
		type: String,
		required: true,
		trim: true
	},
	postal_code: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid.')
			}
		}
	},
	password: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.length < 7) throw new Error('Password must be at least 7 characters long.');
			if (value.toLowerCase().includes('password')) throw new Error('Password must not include the word "password".')
		}
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}]
}, {
	timestamps: true
});

userSchema.pre('save', async function (next) {
	const user = this;
	user.password = await bcrypt.hash(user.password, 8);
	next();
});

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

	try {
		await user.save();
		user.tokens = user.tokens.concat({ token });
	} catch (e) {

	}

	return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error('Unable to login.')
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error('Unable to login.')
	}

	return user
};

userSchema.post('save', function (error, doc, next) {
	if (error.name === 'MongoError' && error.code === 11000) {
		next(new Error('The provided E-mail is already taken.'));
	}
	if (error.name === 'ValidationError') {
		next(new Error(`The following fields are missing: ${Object.entries(error.errors).map(el => el[0]).join(', ')}.`));
	}
	else {
		next(error);
	}
});

const User = mongoose.model('User', userSchema);

module.exports = User;