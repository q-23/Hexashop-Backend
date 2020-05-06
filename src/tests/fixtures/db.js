const Product = require('../../models/product');

const setupDatabase = async () => {
	await Product.deleteMany()
}

module.exports = {
	setupDatabase
}