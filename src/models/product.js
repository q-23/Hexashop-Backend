const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	price: {
		type: Number,
		required: true,
		min: 0.01
	},
	image_main: {
		type: Buffer
	},
	image_gallery: {
		type: Buffer
	}
}, {
	timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;