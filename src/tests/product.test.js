const app = require('../app');

const request = require('supertest');

const Category = require('../models/category');
const Product = require('../models/product');
const Brand = require('../models/brand');
const Image = require('../models/image');

const { setupProducts, productsArray, userOne } = require('./fixtures/db')
const [productOne, productTwo] = productsArray;

beforeEach(setupProducts);

describe('[PRODUCT] - ', () => {
	test('Should create product with name, description and price', async () => {
		const response = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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

	test('Should create product with category and create relation', async () => {
		const response = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
			.send({})
			.expect(400)
	});

	test('Should not create product with price equal or less than zero', async () => {
		const response = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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

	test('Should provide image links', async () => {
		const response = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
			.attach('images[0]', './src/tests/fixtures/imgtest.png')
			.field('images[0][description]', 'description')
			.attach('images[1]', './src/tests/fixtures/imgtest2.jpg')
			.field('images[1][description]', 'description')
			.field('images[1][main]', true)
			.field('name', 'Product')
			.field('description', 'Some desc')
			.field('price', 23)
			.expect(201)

		const productResponse = await request(app)
			.get(`/product/${response.body._id}`)

		expect(productResponse.body.image_thumbnail.link).toBe(`${process.env.HOST_URL}/image/${productResponse.body.image_thumbnail._id}`);
		productResponse.body.images.forEach(image => expect(image.link).toBe(`${process.env.HOST_URL}/image/${image._id}`))
	});

	test('Should not allow products with multiple main images', async () => {
		await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
	});


	test('Should get multiple products', async () => {
		const response = await request(app)
			.get('/product')
			.send()
			.expect(200)

		expect(response.body.products).toHaveLength(15)
	});

	test('Should send links to thumbnails', async () => {
		const response = await request(app)
			.get('/product')
			.send()
			.expect(200)
		expect(response.body.products).toHaveLength(15)
	});

	test('Should use limiter', async () => {
		const response = await request(app)
			.get('/product')
			.query({ limit: 10 })
			.send()
			.expect(200);

		expect(response.body.products).toHaveLength(10)
	});

	test('Should use pagination', async () => {
		const response = await request(app)
			.get('/product')
			.query({ limit: 10 })
			.query({ skip: 10 })
			.send()
			.expect(200);

		expect(response.body.products).toHaveLength(5)
	});

	test('Should send product count', async () => {
		const response = await request(app)
			.get('/product')
			.expect(200);

		expect(response.body.count).toBe(15)
	});

	test('Should find product by id', async () => {
		const response = await request(app)
			.get(`/product/${productOne._id}`)
			.send()
			.expect(200);

		expect(response.body.products).not.toBeNull();
	});

	test('Should not find not existing product', async () => {
		await request(app)
			.get(`/product/${productOne._id}23`)
			.send()
			.expect(404);
	});

	test("Should ommit buffers when retrieving images", async () => {
		const response = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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

		product.body.images.forEach(image => {
			expect(image).toHaveProperty('_id')
			expect(image).not.toHaveProperty('image')
		})
	});

	test('Should create thumbnails from main pictures', async () => {
		const product_saved = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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

		expect(products.body.products.some(el => 'image_thumbnail' in el)).toBeTruthy();
		expect(products.body.products.every(el => !('images' in el))).toBeTruthy();
	});

	test('Should sort products', async () => {
		await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).send({
				name: 'Produkt pierwszy',
				description: 'Opis produktu pierwszego',
				price: 99.99
			})
			.expect(201);

		await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).send({
				name: 'Produkt drugi',
				description: 'Opis produktu drugiego',
				price: 919.89
			})
			.expect(201);

		const products = await request(app)
			.get('/product')
			.query({ sortBy: 'price:asc' })
			.expect(200);

		const productsPrices = products.body.products.map(({ price }) => price);
		expect(productsPrices.sort((a, b) => a.price - b.price)).toEqual(productsPrices);
	});

	test("Should get product with it's categories", async () => {
		const category = await Category.find({ category_name: 'Kategoria pierwsza' });
		const product = await new Product({ name: 'prod', description: 'desc', price: 23, category: category[0]._id }).save();

		const productGet = await request(app)
			.get(`/product/${product._id}`)
			.expect(200);

		expect(productGet.body.category[0]).toMatchObject({ category_name: 'Kategoria pierwsza' })
	});

	test('Should get product with two categories', async () => {
		const category = await Category.find({ category_name: 'Kategoria pierwsza' });
		const categoryTwo = await Category.find({ category_name: 'Kategoria druga' });
		const product = await new Product({
			name: 'produkt',
			description: 'opis',
			price: 23,
			category: [category[0]._id, categoryTwo[0]._id]
		}).save();

		const productGet = await request(app)
			.get(`/product/${product._id}`)
			.expect(200);

		expect(productGet.body.category[0]).toMatchObject({ category_name: 'Kategoria pierwsza' })
		expect(productGet.body.category[1]).toMatchObject({ category_name: 'Kategoria druga' })
	});

	test('Should find products by name', async () => {
		await new Product({
			name: 'Klapki',
			description: 'opis',
			price: 23
		}).save();

		const product = await request(app)
			.get('/product')
			.query({ search: 'name:klapki' })
			.expect(200)
		expect(product.body.products[0].name).toBe('Klapki');
		expect(product.body.count).toBe(1);
	});

	test('Should find products from cart', async () => {
		const allProducts = await Product.find();
		const [firstProd, secondProd, thirdProd] = allProducts;

		const products = await request(app)
			.get('/product/cart_items')
			.send({ cart_items_ids: [firstProd._id, secondProd._id, thirdProd._id] })
			.expect(200)

		expect(products.body.length).toBe(3);
		products.body.every(product => expect(!product.images && !product.description && product.image_thumbnail && product.name && product.price))
	});


	test('Should delete product by ID', async () => {
		const productFound = await Product.findOne({ name: 'Product name 1'})
		await request(app)
			.delete(`/product/${productFound._id}`)
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).expect(200);

		const product = Product.findById(productTwo._id);
		expect(product.body).toBeFalsy();
	});

	test('Should delete multiple products', async () => {
		const [productOne, productTwo, productThree] = productsArray;
		const product_ids = [productOne, productTwo, productThree].map(({ _id }) => _id)
		await request(app)
			.delete('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).send(product_ids)
			.expect(200);

		try {
			product_ids.forEach(async el => expect(await Product.findById(el).body).toBeFalsy());
		} catch (e) {
			console.log(e)
		}
	});

	test('Should send brand name', async () => {
		const brand = await Brand.findOne({ brand_name: 'Marka pierwsza' });

		const product = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
			.send({  name: 'Prod', description: 'desc', price: 23, brand: brand._id });

		const productResponse = await request(app)
			.get(`/product/${product.body._id}`)

		expect(productResponse.body.brand).toMatchObject({ brand_name: 'Marka pierwsza' })
	});

	test('Should delete product images when deleting product', async () => {
		const response = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).expect(200);

		try {
			images.forEach(async el => expect(await Image.findById(el).body).toBeFalsy());
			expect(await Image.findById(image_thumbnail)).toBeFalsy();
		} catch (e) {
			console.log(e)
		}
	});

	test('Should update existing products', async () => {
		const productOne = await request(app)
			.post('/product')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).send({
				name: 'asd',
				description: 'asd',
				price: 12
			});

		await request(app)
			.patch(`/product/${productOne.body._id}`)
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`).send({
				name: 'Lorem ipsum'
			})
			.expect(200);

		const productUpdated = await Product.findById(productOne.body._id);

		expect(productUpdated.name).toBe('Lorem ipsum');
	});
});