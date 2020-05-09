const mongoose = require('mongoose');
const Image = require('./image.js');
const sharp = require('sharp');

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
	images: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Image'
	}],
	image_thumbnail: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Image'
	}
}, {
	timestamps: true
});


productSchema.pre('save', async function (next) {
	const product = this;
		if(product.images.length) {
			const image_main = await Image.find({ _id: product.images, main: true });

			const buffer = await sharp(image_main[0].image).resize({
				width: 250,
				height: 250
			}).png().toBuffer();

			const image_thumbnail = new Image({ image: buffer, thumbnail: true });
			const imageThumbnailSaved = await image_thumbnail.save();
			product.image_thumbnail = imageThumbnailSaved._id;
		}
	next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;