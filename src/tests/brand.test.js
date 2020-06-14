const request = require('supertest');
const Brand = require('../models/brand');
const Product = require('../models/product');
const app = require('../app');
const { setupProducts } = require('./fixtures/db')

beforeEach(setupProducts)

describe('[BRAND] - ', () => {
    test('Should add brand', async () => {
        const response = await request(app)
            .post('/brand')
            .send({
                brand_name: 'Marka pierwsza',
                category_path: '/path'
            })
            .expect(201)

        const brandFound = await Brand.findById(response.body._id)
        expect(brandFound).toBeTruthy()
    });

    test('Should add slugified brand paths when none is provided', async () => {
        await request(app)
          .post('/brand')
          .send({
              brand_name: 'Kategoria pierwsza'
          })
          .expect(201)

        const brand = await Brand.findOne({brand_name: 'Kategoria pierwsza'});

        expect(brand.brand_path).toBe('Kategoria-pierwsza')
    });

    test("Should get brand and it's products", async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka pierwsza' });
        const brandTwo = await Brand.findOne({ brand_name: 'Marka druga' });

        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'c', description: 'd', price: 23, brand: brandTwo._id }).save();

        const categoryResponse = await request(app)
            .get(`/brand/${brand._id}`)
            .expect(200)

        expect(categoryResponse.body.brand_name).toBe('Marka pierwsza');
        expect(categoryResponse.body.products.length).toBe(1)
    });

    test('Should get all brands', async () => {
        const response = await request(app)
            .get('/brand')
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    test('Should delete brand and update linked products brand array', async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka pierwsza' });

        const product = await new Product({ name: 'a', description: 'b', price: 23, brand_name: brand._id }).save();

        await request(app)
            .delete(`/brand/${brand._id}`)
            .expect(201);

        const productRequest = await Product.findById(product._id);
        expect(productRequest.brand_name).toBeFalsy();
    });

    test('Should update brand', async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka pierwsza' });

        const brandUpdated = await request(app)
            .patch(`/brand/${brand._id}`)
            .send({ brand_name: 'Marka trzecia',
                brand_path: '/path'
            })
            .expect(201);

        expect(brandUpdated.body.brand_name).toBe('Marka trzecia');
    });
})