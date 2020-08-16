const mongoose = require('mongoose');
const slugify = require('slugify');

const Product = require('./product');

const brandSchema = new mongoose.Schema({
	brand_name: {
		type: String,
		trim: true,
		required: true
	},
	brand_path: {
		type: String,
		trim: true
	},
	brand_image: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Image'
	}
}, {
	timestamps: true
});

brandSchema.pre('findOneAndDelete', async function (next) {
	const brand = this;
	await Product.updateMany({ brand_name: brand._conditions._id}, { brand_name: null });
	next();
});

brandSchema.pre('save', function (next) {
	const brand = this;
	if(!brand.brand_path) {
		brand.brand_path = slugify(brand.brand_name)
	}
	next();
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;