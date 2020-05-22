const app = require('../app');

const request = require('supertest');

const User = require('../models/user');

const { setupUsers, userTwo } = require('./fixtures/db.js');

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

    test('Should not permit duplicate emails', async () => {
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


        await request(app)
            .post('/user')
            .send(userCredentials)
            .expect(201);

        await request(app)
            .post('/user')
            .send(userCredentials)
            .expect(400);
    });

    test('Should not add users with incomplete data', async () => {
        const userCredentials = {
            name: 'Jan',
            surname: 'Kowalski',
            city: 'Łódź',
            password: 'asdf1234',
            postal_code: '12-345'
        };

        await request(app)
            .post('/user')
            .send(userCredentials)
            .expect(400);

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
    });

    test("Should get user's account", async () => {
        const loginResponse = await request(app)
            .post('/user/login')
            .send({
                email: userTwo.email,
                password: userTwo.password
            })
            .expect(200);
        const accountResponse = await request(app)
            .get('/user/me')
            .set('Authorization', `Bearer ${loginResponse.body.user.tokens[0].token}`)
            .expect(200)

        const { password, _id, ...userData } = userTwo;
        expect(accountResponse.body).toMatchObject(userData);
    });

    test('Should add admin users', async () => {
        const adminUserResponse = await request(app)
            .post('/user')
            .send({
                name: 'Jan',
                surname: 'Kowalski',
                city: 'Łódź',
                street: 'Piotrkowska',
                house_number: '93',
                email: 'jan@kowalski.pl',
                password: 'asdf1234',
                postal_code: '12-345',
                isAdmin: true,
            }).expect(201);

        expect(adminUserResponse.body.user.isAdmin).toBeTruthy()
    });

    test('Should not let non administrative users add new products', async () => {
        const { email, password } = userTwo;
        const response = await request(app)
            .post('/user/login')
            .send({ email, password })
            .expect(200);

        await request(app)
            .post('/product')
            .set('Authorization', `Bearer ${response.body.user.tokens[0].token}`)
            .send({
                name: 'asd',
                description: 'asdg',
                price: 23
            })
            .expect(403)
    });

    test('Should be able to log out', async () => {
        await request(app)
            .post('/user/logout')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .expect(200);

        expect(await (await User.findById(userTwo._id)).toObject().tokens.length).toBe(0);
    })
});