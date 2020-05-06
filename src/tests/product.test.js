const request = require('supertest');
const Product = require('../models/product');
const app = require('../app');

const { setupDatabase, productsArray } = require('./fixtures/db')
const productOne = productsArray[0];

beforeEach(setupDatabase);

// POST
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
});

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
});

// GET

test('Should get multiple products', async () => {
	const response = await request(app)
		.get('/product')
		.send()
		.expect(200)

	expect(response.body).toHaveLength(15)
});

test('Should use limiter', async () => {
	const response = await request(app)
		.get('/product')
		.query({limit: 10})
		.send()
		.expect(200);

	expect(response.body).toHaveLength(10)
});

test('Should use pagination', async () => {
	const response = await request(app)
		.get('/product')
		.query({limit: 10})
		.query({skip: 10})
		.send()
		.expect(200);

	expect(response.body).toHaveLength(5)
});

test('Should find product by id', async () => {
	const response = await request(app)
		.get(`/product/${productOne._id}`)
		.send()
		.expect(200);

	expect(response.body).toBeTruthy();
});

test('Should not find not existing product', async () => {
	await request(app)
		.get(`/product/${productOne._id}23`)
		.send()
		.expect(404);
});