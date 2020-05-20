const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const Category = require('../../models/category');
const Product = require('../../models/product');
const Image = require('../../models/image');
const User = require('../../models/user');

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
	tokens: [{
		token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
	}]
};

const setupUsers = async () => {
	await User.deleteMany();
	await new User(userOne).save();
	await new User(userTwo).save();
}

module.exports = {
	setupImages,
	imagesArray,
	setupUsers,
	setupProducts,
	productsArray,
	userOneId,
	userOne,
	userTwoId,
	userTwo
};