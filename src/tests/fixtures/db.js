const mongoose = require('mongoose');
const Product = require('../../models/product');


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

const productsArray = populateProducts(15);

const setupDatabase = async () => {
	await Product.deleteMany();
	productsArray.forEach(async el => await new Product(el).save())
}

module.exports = {
	setupDatabase,
	productsArray
}