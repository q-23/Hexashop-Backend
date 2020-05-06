const request = require('supertest');
const Product = require('../models/product');
const app = require('../app');

const { setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase);

test('Should create product with, description and price', async () => {
	const result = await request(app)
		.post('/product')
		.send({
			name: 'Produkt pierwszy',
			description: 'Opis produktu pierwszego',
			price: 23.23
		})
		.expect(201)

	expect(result.body).toMatchObject({
		name: 'Produkt pierwszy',
		description: 'Opis produktu pierwszego',
		price: 23.23
	})

	const product = Product.findById(result.body._id);

	expect(product).not.toBeNull();
});

test('Should not create product without data', async () => {
	const error = await request(app)
		.post('/product')
		.send({})
		.expect(400)

	expect(error.body.error).toBe('Please provide all necessary product info.')
});

test('Should not create product with price equal or less than zero', async () => {
	await request(app)
		.post('/product')
		.send({
			name: 'Product',
			description: 'Description',
			price: 0
		})
		.expect(400)
})

test('Should upload product image', async () => {
	await request(app)
		.post('/product')
		.attach('image_main', './src/tests/fixtures/')
		.field('name', 'Product')
		.field('description', 'Some desc')
		.expect(201)
})