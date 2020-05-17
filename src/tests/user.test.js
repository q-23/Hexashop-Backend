const request = require('supertest');
const User = require('../models/user');
const app = require('../app');
const { setupUsers } = require('./fixtures/db.js');

beforeEach(setupUsers);

describe('[USER] - ', () => {
    test('Should add user account', async () => {
        const userCredentials = {
            name: 'Jan',
            surname: 'Kowalski',
            city: 'Łódź',
            street: 'Piotrkowska',
            house_number: '93',
            email: 'jan@kowalski.pl',
            password: 'asdf1234',
            postal_code: '12-345'
        };


        const response = await request(app)
            .post('/user')
            .send(userCredentials)
            .expect(201);

        const userFound = await User.findById(response.body.user._id);
        expect(userFound).toBeTruthy();
        expect(userFound).toMatchObject(userCredentials);
    });
})