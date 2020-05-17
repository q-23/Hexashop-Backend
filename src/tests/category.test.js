const request = require('supertest');
const Category = require('../models/category');
const Product = require('../models/product');
const app = require('../app');
const { setupProducts } = require('./fixtures/db')

beforeEach(setupProducts)

describe('[CATEGORY] - ', () => {
    test('Should add category', async () => {
        const response = await request(app)
			.post('/category')
			.send({
				category_name: 'Kategoria pierwsza'
			})
            .expect(201)

        const categoryFound = await Category.findById(response.body._id)
        expect(categoryFound).toBeTruthy()
    });

    test("Should get category and it's products", async () => {
        const category = await Category.find({category_name: 'Kategoria pierwsza'});
        const categoryTwo = await Category.find({category_name: 'Kategoria druga'});

        await new Product({ name: 'a', description: 'b', price: 23, category: category[0]._id }).save();
        await new Product({ name: 'c', description: 'd', price: 23, category: [category[0]._id, categoryTwo[0]._id] }).save();
        
        const categoryResponse = await request(app)
            .get(`/category/${category[0]._id}`)
            .expect(200)

        expect(categoryResponse.body.category_name).toBe('Kategoria pierwsza');
        expect(categoryResponse.body.products.length).toBe(2)
    });
})