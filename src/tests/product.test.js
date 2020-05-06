const request = require('supertest');
const Product = require('../models/product');
const app = require('../app');

const { setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase);

test('Should create product with, description and price', async () => {
	const response = await request(app)
		.post('/product')
		.send({
			name: 'Produkt pierwszy',
			description: 'Opis produktu pierwszego',
			price: 23.23
		})
		.expect(201)

	expect(response.body).toMatchObject({
		name: 'Produkt pierwszy',
		description: 'Opis produktu pierwszego',
		price: 23.23
	})

	const product = Product.findById(response.body._id);
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
	const response = await request(app)
		.post('/product')
		.send({
			name: 'Product',
			description: 'Description',
			price: 0
		})
		.expect(400)

	expect(response.body._id).toBeFalsy()
})

test('Should upload product images', async () => {
	const response = await request(app)
		.post('/product')
		.attach('images[0]', './src/tests/fixtures/imgtest.png')
		.field('images[0][name]', 'description')
		.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
		.field('images[1][name]', 'description')
		.field('images[1][main]', true)
		.field('name', 'Product')
		.field('description', 'Some desc')
		.field('price', 23)
		.expect(201)

	const product = await Product.findById(response.body._id)
	expect(product).not.toBeNull()
})