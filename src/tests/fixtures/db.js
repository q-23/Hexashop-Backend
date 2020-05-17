const mongoose = require('mongoose');
const Product = require('../../models/product');
const Image = require('../../models/image');
const Category = require('../../models/category');
const User = require('../../models/user');
const fs = require('fs');

const populateProducts = count => {
	const returnArray = [];

	for (let i = 0; i < count; i++) {
		returnArray.push({
			_id: new mongoose.Types.ObjectId(),
			description: `product description ${i}`,
			name: `Product name ${i}`,
			price: 10 + i
		})
	}
	return returnArray;
}

const imagesArray = [
	{
		main: true,
		image: fs.readFileSync(__dirname + '/imgtest.png'),
		description: 'Lorem ipsum'
	},
	{
		main: false,
		image: fs.readFileSync(__dirname + '/imgtest2.jpg'),
		description: 'Lorem ipsum dolor'
	}
]

const categoryArray = [
	{category_name: 'Kategoria pierwsza'},
	{category_name: 'Kategoria druga'}
]

const productsArray = populateProducts(15);

const setupProducts = async () => {
	await Product.deleteMany();
	await Image.deleteMany();
	await Category.deleteMany();
	await Promise.all(productsArray.map(async el => await new Product(el).save()));
	await Promise.all(categoryArray.map(async el => await new Category(el).save()));
};

const setupImages = async () => {
	await Image.deleteMany();
	await Promise.all(imagesArray.map(async el => await new Image(el).save()))
}

const setupUsers = async () => {
	await User.deleteMany();
}

module.exports = {
	setupImages,
	imagesArray,
	setupUsers,
	setupProducts,
	productsArray
}