const mongoose = require('mongoose');
const Product = require('./product');

const categorySchema = new mongoose.Schema({
	category_name: {
		type: String,
        trim: true,
        required: true
    }
}, {
	timestamps: true
});

categorySchema.pre('findOneAndDelete', async function (next) {
    const category = this;
	await Product.updateMany({ category: category._conditions._id}, { $pull: {category: category._conditions._id}});
	next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;