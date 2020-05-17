const request = require('supertest');
const User = require('../models/user');
const app = require('../app');
const { setupUsers, userTwo, userTwoId } = require('./fixtures/db.js');

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

        const { password, ...rest } = userCredentials
        const userFound = await User.findById(response.body.user._id);
        expect(userFound).toBeTruthy();
        expect(userFound).toMatchObject(rest);
    });

    test('Should not store passwords in plain text', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                name: 'Jan',
                surname: 'Kowalski',
                city: 'Łódź',
                street: 'Piotrkowska',
                house_number: '93',
                email: 'jan@kowalski.pl',
                password: 'asdf1234',
                postal_code: '12-345'
            })
            .expect(201);

        const userAdded = await User.findById(response.body.user._id)

        expect(userAdded.password).not.toBe('asdf1234');
    });

    test('Should log in existing user', async () => {
        await request(app)
            .post('/user/login')
            .send({
                email: 'stefan@bolkowski.pl',
                password: 'asdf1234'
            })
            .expect(200);
    });


    test('Should not log in with wrong credentials', async () => {
        await request(app)
            .post('/user/login')
            .send({
                email: 'stefan@bolkowski.pl',
                password: 'badpass2345'
            })
            .expect(400);
    });


    test('Should update existing user when logged in', async () => {
        const response = await request(app)
            .post('/user/login')
            .send({
                email: userTwo.email,
                password: userTwo.password
            })
            .expect(200);

        await request(app)
            .patch('/user')
            .set('Authorization', `Bearer ${response.body.user.tokens[0].token}`)
            .send({ name: 'Jan' })
            .expect(200);
    })
})