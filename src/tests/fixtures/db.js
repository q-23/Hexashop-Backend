const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const Category = require('../../models/category');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Image = require('../../models/image');
const User = require('../../models/user');

const populateProducts = (count, images) => {
	const returnArray = [];

	for (let i = 0; i < count; i++) {
		returnArray.push({
			_id: new mongoose.Types.ObjectId(),
			description: `product description ${i}`,
			name: `Product name ${i}`,
			images: images,
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
	{category_name: 'Kategoria pierwsza', category_path: '/path'},
	{category_name: 'Kategoria druga', category_path: '/path2'}
]

const productsArray = populateProducts(15);

const setupProducts = async () => {
	await User.deleteMany();
	await Image.deleteMany();
	await Product.deleteMany();
	await Category.deleteMany();
	await new User(userOne).save();
	const images = await Promise.all(imagesArray.map(async el => await new Image(el).save()))
	const productsArrayWithImages = populateProducts(15, images);
	await Promise.all(productsArrayWithImages.map(async el => await new Product(el).save()));
	await Promise.all(categoryArray.map(async el => await new Category(el).save()));
};

const setupImages = async () => {
	await Image.deleteMany();
	await User.deleteMany();
	await new User(userOne).save();
	await Promise.all(imagesArray.map(async el => await new Image(el).save()))
}

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
	_id: userOneId,
	name: 'Stefan',
	surname: 'Kwaśniewski',
	city: 'Kraków',
	street: 'Wielicczańska',
	house_number: '23',
	email: 'stefan@bolkowski.pl',
	password: 'asdf1234',
	postal_code: '12-345',
	isAdmin: true,
	isVerified: true,
	tokens: [{
		token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
	}]
};

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
	_id: userTwoId,
	name: 'Aleksander',
	surname: 'Kwiatkowski',
	city: 'Gdańsk',
	street: 'Długa',
	house_number: '23',
	email: 'aleksander.kwiatkowski@gmail.com',
	password: 'abcd1234',
	postal_code: '80-827',
	isVerified: true,
	tokens: [{
		token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
	}]
};

const ordersArray = productsArray.map((product_id, index) => {
	return ({
		ordered_products: {
			_id: product_id,
			count: index + 1
		},
		customer_id: index%2 === 0 ? userOneId : userTwoId,
		completed: index%3 === 0
	})
});


const setupUsers = async () => {
	await User.deleteMany();
	await new User(userOne).save();
	await new User(userTwo).save();
}

const setupOrders = async () => {
	await User.deleteMany();
	await Order.deleteMany();
	await Product.deleteMany();
	await new User(userTwo).save();
	await new User(userOne).save();
	await Promise.all(productsArray.map(async el => await new Product(el).save()));
	await Promise.all(ordersArray.map(async el => await new Order(el).save()));
}

module.exports = {
	productsArray,
	setupProducts,
	setupImages,
	imagesArray,
	setupOrders,
	setupUsers,
	userOneId,
	userTwoId,
	userOne,
	userTwo
};