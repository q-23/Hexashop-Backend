const request = require('supertest');
const Category = require('../models/category');
const Product = require('../models/product');
const app = require('../app');
const { setupProducts, userOne } = require('./fixtures/db')
beforeEach(setupProducts)

describe('[CATEGORY] - ', () => {
    test('Should add category', async () => {
        const response = await request(app)
            .post('/category')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                category_name: 'Kategoria pierwsza',
                category_path: '/path'
            })
            .expect(201)

        const categoryFound = await Category.findById(response.body._id)
        expect(categoryFound).toBeTruthy()
    });

    test('Should not add category without category path', async () => {
        await request(app)
          .post('/category')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .send({
              category_name: 'Kategoria pierwsza'
          })
          .expect(400)
    });

    test("Should get category and it's products", async () => {
        const category = await Category.find({ category_name: 'Kategoria pierwsza' });
        const categoryTwo = await Category.find({ category_name: 'Kategoria druga' });

        await new Product({ name: 'a', description: 'b', price: 23, category: category[0]._id }).save();
        await new Product({ name: 'c', description: 'd', price: 23, category: [category[0]._id, categoryTwo[0]._id] }).save();

        const categoryResponse = await request(app)
            .get(`/category/${category[0]._id}`)
            .expect(200)

        expect(categoryResponse.body.category_name).toBe('Kategoria pierwsza');
        expect(categoryResponse.body.products.length).toBe(2)
    });

    test("Should use pagination and limiter when fetching categories", async () => {
        const category = await Category.find({ category_name: 'Kategoria pierwsza' });
        const categoryTwo = await Category.find({ category_name: 'Kategoria druga' });

        await new Product({ name: 'a', description: 'b', price: 23, category: category[0]._id }).save();
        await new Product({ name: 'aa', description: 'bb', price: 231, category: category[0]._id }).save();
        await new Product({ name: 'c', description: 'd', price: 23, category: [category[0]._id, categoryTwo[0]._id] }).save();
        await new Product({ name: 'cf', description: 'sdfd', price: 231, category: [category[0]._id, categoryTwo[0]._id] }).save();

        const categoryResponse = await request(app)
          .get(`/category/${category[0]._id}`)
          .query({ skip: 2, limit: 2 })
          .expect(200);

        expect(categoryResponse.body.category_name).toBe('Kategoria pierwsza');
        expect(categoryResponse.body.products.length).toBe(2)
        expect(categoryResponse.body.count).toBe(4)
    });

    test('Should get all categories', async () => {
        const response = await request(app)
            .get('/category')
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    test('Should delete category and update linked products category array', async () => {
        const category = await Category.find({ category_name: 'Kategoria pierwsza' });

        const product = await new Product({ name: 'a', description: 'b', price: 23, category: category[0]._id }).save();

        await request(app)
            .delete(`/category/${category[0]._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .expect(201);

        const productRequest = await Product.findById(product._id);
        expect(productRequest.category.length).toBe(0);
    });

    test('Should update category', async () => {
        const category = await Category.find({ category_name: 'Kategoria pierwsza' });

        const categoryUpdated = await request(app)
            .patch(`/category/${category[0]._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({ category_name: 'Kategoria trzecia',
                category_path: '/path'
              })
              .expect(201);

        expect(categoryUpdated.body.category_name).toBe('Kategoria trzecia');
    });
})