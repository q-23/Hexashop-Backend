const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
	description: {
		type: String,
		trim: true
	},
	image: {
		type: Buffer,
		required: true
	},
	main: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;