const app = require('../app');

const Product = require('../models/product');
const Order = require('../models/order');

const request = require('supertest');

const { setupOrders, userTwo, userOne } = require('./fixtures/db')

const adminUser = userOne;
const regularUser = userTwo;

const adminUserId = adminUser._id;
const regularUserId = regularUser._id;

const adminUserToken = adminUser.tokens[0].token;
const regularUserToken = regularUser.tokens[0].token;

beforeEach(setupOrders);

describe('[ORDER] - ', () => {
    test('Should place orders', async () => {
        const allProducts = await Product.find();
        const allProductsIds = allProducts.map(({ _id }) => _id);
        const productsWithQuantity = allProductsIds.map((el, idx) => ({
            product_id: el,
            count: idx + 1
        }))

        const result = await request(app)
            .post('/order/new')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send({
                customer_id: regularUserId,
                ordered_products: productsWithQuantity
            })
            .expect(200)

        const orderInDb = await Order.findById(result.body._id);

        expect(orderInDb.ordered_products.length).toBe(15)
        expect(orderInDb.completed).toBeFalsy();
    });

    test("Should get user's orders", async () => {
        const allProducts = await Product.find();
        const allProductsIds = allProducts.map(({ _id }) => _id);

        await request(app)
            .post('/order/new')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send({
                customer_id: regularUserId,
                ordered_products: {
                    product_id: allProductsIds[0],
                    count: 1
                }
            })
            .expect(200)

        await request(app)
            .post('/order/new')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send({
                customer_id: regularUserId,
                ordered_products: [{
                    product_id: allProductsIds[1],
                    count: 2
                }, {
                    product_id: allProductsIds[2],
                    count: 3
                }]
            })
            .expect(200)

        const result = await request(app)
            .get('/order/my_orders')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(200);

        expect(result.body.length).toBe(9)
    });

    test("Should get all orders when logged in as admin", async () => {
        const allProducts = await Product.find();
        const allProductsIds = allProducts.map(({ _id }) => _id);

        await request(app)
            .post('/order/new')
            .set('Authorization', `Bearer ${regularUserToken}`)
            .send({
                customer_id: regularUserId,
                ordered_products: {
                    product_id: allProductsIds[0],
                    count: 1
                }
            })
            .expect(200)

        await request(app)
            .post('/order/new')
            .set('Authorization', `Bearer ${adminUserToken}`)
            .send({
                customer_id: adminUserId,
                ordered_products: [{
                    product_id: allProductsIds[1],
                    count: 2
                }, {
                    product_id: allProductsIds[2],
                    count: 3
                }]
            })
            .expect(200)

        const result = await request(app)
            .get('/order/all_orders')
            .set('Authorization', `Bearer ${adminUserToken}`)
            .expect(200);

        expect(result.body.length).toBe(17);
    });

    test('Should use pagination - admin, all orders', async () => {
        const result = await request(app)
            .get('/order/all_orders')
            .query({ limit: 10, skip: 10 })
            .set('Authorization', `Bearer ${adminUserToken}`)
            .expect(200);

        expect(result.body.length).toBe(5);

        const resultSkip = await request(app)
            .get('/order/all_orders')
            .query({ limit: 2, skip: 10 })
            .set('Authorization', `Bearer ${adminUserToken}`)
            .expect(200);

        expect(resultSkip.body.length).toBe(2);

    });

    test('Should use pagination - reqular user', async () => {
        const result = await request(app)
            .get('/order/my_orders')
            .query({ limit: 10, skip: 5 })
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(200);

        expect(result.body.length).toBe(2);
    });

    test("Should get specific user's orders when logged in as admin", async () => {
        const result = await request(app)
            .get(`/order/all_orders/${regularUserId}`)
            .set('Authorization', `Bearer ${adminUserToken}`)
            .expect(200);

    });
});