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
	},
	thumbnail: {
		type: Boolean
	},
	product_id: {
		type: mongoose.Schema.Types.ObjectId
	}
}, {
	timestamps: true
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;