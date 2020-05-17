const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

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
			if(value.length < 7) throw new Error('Password must be at least 7 characters long.');
			if(value.toLowerCase().includes('password')) throw new Error('Password must not include the word "password".')
		}
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


userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token
};

const User = mongoose.model('User', userSchema);

module.exports = User;