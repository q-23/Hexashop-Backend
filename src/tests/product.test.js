const request = require('supertest');
const Product = require('../models/product');
const Image = require('../models/image');
const app = require('../app');

const { setupProducts, productsArray } = require('./fixtures/db')
const [productOne, productTwo] = productsArray;

beforeEach(setupProducts);

// POST
describe('[PRODUCT] - ', () => {
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
		await request(app)
			.post('/product')
			.send({})
			.expect(400)
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
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201)
		const product = await Product.findById(response.body._id)

		expect(product).not.toBeNull()
		expect(product.images.length).toBe(2)
	});

	test('Should not allow products with multiple main images', async () => {
		await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.field('images[0][main]', true)
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(400);
	});

	test('Should not allow products with images lacking main image', async () => {
		await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.field('images[0][main]', false)
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', false)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(400);
	});

	test('Should not upload not allowed file types files', async () => {
		const response = await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/note.txt')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(500)

		const product = await Product.findById(response.body._id)
		expect(product).toBeNull()
	});

	test('Should assign product id to images', async () => {
		const response = await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201);

		const imagesSaved = await Image.find({ _id: [...response.body.images, response.body.image_thumbnail] });
		expect(imagesSaved.every(el => el.product_id)).toBeTruthy();
	})

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
			.query({ limit: 10 })
			.send()
			.expect(200);

		expect(response.body).toHaveLength(10)
	});

	test('Should use pagination', async () => {
		const response = await request(app)
			.get('/product')
			.query({ limit: 10 })
			.query({ skip: 10 })
			.send()
			.expect(200);

		expect(response.body).toHaveLength(5)
	});

	test('Should find product by id', async () => {
		const response = await request(app)
			.get(`/product/${productOne._id}`)
			.send()
			.expect(200);

		expect(response.body).not.toBeNull();
	});

	test('Should not find not existing product', async () => {
		await request(app)
			.get(`/product/${productOne._id}23`)
			.send()
			.expect(404);
	});

	test('Should retrieve product images', async () => {
		const response = await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201)
		const { _id } = response.body;

		const product = await request(app)
			.get(`/product/${_id}`);

		product.body.images.forEach(image => expect(image).toHaveProperty('image'))
	});

	test('Should create thumbnails from main pictures', async () => {
		const product_saved = await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201);


		expect(product_saved.body.image_thumbnail).toBeTruthy();
	});

	test('Should send only tumbnail when fetching bulk products', async () => {
		await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201);

		const products = await request(app)
			.get('/product')
			.send()
			.expect(200)

		expect(products.body.some(el => 'image_thumbnail' in el)).toBeTruthy();
		expect(products.body.every(el => !('images' in el))).toBeTruthy();
	});

	// DELETE

	test('Should delete product by ID', async () => {
		await request(app)
			.delete(`/product/${productTwo._id}`)
			.expect(200);

		const product = Product.findById(productTwo._id);
		expect(product.body).toBeFalsy();
	});

	test('Should delete multiple products', async () => {
		const [productOne, productTwo, productThree] = productsArray;
		const product_ids = [productOne, productTwo, productThree].map(({ _id }) => _id)
		await request(app)
			.delete('/product')
			.send(product_ids)
			.expect(200);

		try {
			product_ids.forEach(async el => expect(await Product.findById(el).body).toBeFalsy());
		} catch (e) {
			console.log(e)
		}
	});

	test('Should delete product images when deleting product', async () => {
		const response = await request(app)
			.post('/product')
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201);

		const { _id, images, image_thumbnail } = response.body;

		await request(app)
			.delete(`/product/${_id}`)
			.expect(200);

		try {
			images.forEach(async el => expect(await Image.findById(el).body).toBeFalsy());
			expect(await Image.findById(image_thumbnail)).toBeFalsy();
		} catch (e) {
			console.log(e)
		}
	});
});