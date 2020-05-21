const request = require('supertest');
const Order = require('../models/order');
const Product = require('../models/product');
const app = require('../app');
const { setupOrders, userTwo } = require('./fixtures/db')

let userAuthToken = '';
let userId = '';

const adminUserLogin = () => {
    return request(app)
        .post('/user/login')
        .send({ email: userTwo.email, password: userTwo.password })
};

beforeEach(async (done) => {
    await setupOrders();
    const userAuth = await adminUserLogin();
    userAuthToken = userAuth.body.user.tokens[0].token;
    userId = userAuth.body.user._id;
    done()
});

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
            .send({
                customer_id: userId,
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
            .send({
                customer_id: userId,
                ordered_products: {
                    product_id: allProductsIds[0],
                    count: 1
                }
            })
            .expect(200)

        await request(app)
            .post('/order/new')
            .send({
                customer_id: userId,
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
            .set('Authorization', `Bearer ${userAuthToken}`)
            .expect(200);

        expect(result.body.length).toBe(2)
        expect(result.body[0].ordered_products.length).toBe(1)
        expect(result.body[1].ordered_products.length).toBe(2)
    })
});