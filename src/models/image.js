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
	link: {
		type: String
	},
	product_id: {
		type: mongoose.Schema.Types.ObjectId
	}
}, {
	timestamps: true
});

imageSchema.pre('save', async function (next) {
	const image = this;
	image.link = `${process.env.HOST_URL}/image/${image._id}`
	next();
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;