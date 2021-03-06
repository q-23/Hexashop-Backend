const mongoose = require('mongoose');
const slugify = require('slugify');

const Product = require('./product');
const Image = require('./image');

const brandSchema = new mongoose.Schema({
	brand_name: {
		type: String,
		trim: true,
		required: true,
		unique: true
	},
	brand_path: {
		type: String,
		trim: true,
		unique: true
	},
	brand_image: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Image'
	},
	brand_image_link: {
		type: String
	}
}, {
	timestamps: true
});

brandSchema.pre('findOneAndDelete', async function (next) {
	const brand = this;
	const brandDocument = await Brand.findById(brand._conditions._id);
	const brandObject = await brandDocument.toObject();
	if (brandObject.brand_image) {
		await Image.findByIdAndDelete(brandObject.brand_image);
	}
	await Product.updateMany({ brand_name: brand._conditions._id}, { brand_name: null });
	next();
});

brandSchema.pre('save', function (next) {
	const brand = this;
	if(!brand.brand_path) {
		brand.brand_path = '/' + slugify(brand.brand_name).toLowerCase();
	}
	next();
});

brandSchema.pre('save', async function (next) {
	const brand = this;
	if (brand.brand_image) {
		brand.brand_image_link = `${process.env.HOST_URL}/image/${brand.brand_image._id}`;
	}
	next();
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;