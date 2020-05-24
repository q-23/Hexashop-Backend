const request = require('supertest');
const Purchase = require('../models/purchase');
const app = require('../app');
const { setupUsers, userTwo } = require('./fixtures/db')

beforeEach(setupUsers)

describe('[PURCHASE] - ', () => {
    test('Should purchase products when given correct info', async () => {
        const purchaseData = {
            _id: userTwo._id,
            email: userTwo.email,
            amount: 23000
        };

        const response = await request(app)
            .post('/purchase')
            .send(purchaseData)
            .expect(200)

        expect(await (await Purchase.findById(response.body._id)).toObject().status).toBe('succeeded');
    });
});