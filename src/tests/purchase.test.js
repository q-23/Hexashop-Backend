const request = require('supertest');
const Purchase = require('../models/purchase');
const app = require('../app');
const { setupUsers, userTwo, productsArray } = require('./fixtures/db')

beforeEach(setupUsers)

describe('[PURCHASE] - ', () => {
    test('Should purchase products when given correct info', async () => {
        const purchaseData = {
            token: {
                card: {
                    address_city: 'Olsztyn',
                    address_country: 'Poland',
                    address_line1: 'fds',
                    address_line1_check: 'unchecked',
                    address_line2: null,
                    address_state: null,
                    address_zip: '10-111',
                    address_zip_check: 'unchecked',
                    brand: 'Visa',
                    country: 'US',
                    cvc_check: 'unchecked',
                    dynamic_last4: null,
                    exp_month: 11,
                    exp_year: 2022,
                    funding: 'credit',
                    id: '76543245',
                    last4: '4242',
                    metadata: {},
                    name: 'Asdf Asdf',
                    object: 'card',
                    tokenization_method: null
                },
                client_ip: '37.249.219.207',
                created: 1596060321,
                email: 'dfdgfd@sdfsd.pl',
                id: 'tok_1HANOnIepphit2IQWMMsvYPW',
                livemode: false,
                object: 'token',
                type: 'card',
                used: false
            },
            products: {
                [productsArray[0]._id]: 1,
                [productsArray[1]._id]: 2
            }
        };

        await request(app)
            .post('/purchase')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send(purchaseData)
            .expect(200)
    });

    test("Should retrieve all user's purhases", async () => {
        const purchaseData = {
            token: {
                card: {
                    address_city: 'Olsztyn',
                    address_country: 'Poland',
                    address_line1: 'fds',
                    address_line1_check: 'unchecked',
                    address_line2: null,
                    address_state: null,
                    address_zip: '10-111',
                    address_zip_check: 'unchecked',
                    brand: 'Visa',
                    country: 'US',
                    cvc_check: 'unchecked',
                    dynamic_last4: null,
                    exp_month: 11,
                    exp_year: 2022,
                    funding: 'credit',
                    id: '76543245',
                    last4: '4242',
                    metadata: {},
                    name: 'Asdf Asdf',
                    object: 'card',
                    tokenization_method: null
                },
                client_ip: '37.249.219.207',
                created: 1596060321,
                email: 'dfdgfd@sdfsd.pl',
                id: 'tok_1HANOnIepphit2IQWMMsvYPW',
                livemode: false,
                object: 'token',
                type: 'card',
                used: false
            },
            products: {
                [productsArray[0]._id]: 1,
                [productsArray[1]._id]: 2
            }
        };

        await request(app)
          .post('/purchase')
          .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
          .send(purchaseData)
          .expect(200)

        await request(app)
          .post('/purchase')
          .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
          .send(purchaseData)
          .expect(200)

        const purchasesResponse = await request(app)
          .get('/purchase/my_purchases')
          .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
          .expect(200);

        expect(purchasesResponse.body.length).toBe(3);
        purchasesResponse.body.forEach(purchase => purchase.status === 'succeeded' && purchase._id === userTwo._id && purchase.receipt_email === userTwo.email)
    });
});