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
            .post('/user/new')
            .send(userCredentials)
            .expect(201);

        const { password, ...rest } = userCredentials
        const userFound = await User.findOne({ email: 'jan@kowalski.pl' });
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
            .post('/user/new')
            .send(userCredentials)
            .expect(201);

        await request(app)
            .post('/user/new')
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
            .post('/user/new')
            .send(userCredentials)
            .expect(400);

    });

    test('Should not store passwords in plain text', async () => {
        const response = await request(app)
            .post('/user/new')
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

        const userAdded = await User.findOne({ email: 'jan@kowalski.pl' })
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
            .set('Authorization', `Bearer ${response.body.token}`)
            .send({ name: 'Jan' })
            .expect(200);
    });

  test('Should update user password', async () => {
    const newPassword = 'Testpass123'

    const response = await request(app)
      .post('/user/login')
      .send({
        email: userTwo.email,
        password: userTwo.password
      })
      .expect(200);

    await request(app)
      .patch('/user')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send({ password: newPassword })
      .expect(200);

    await request(app)
      .post('/user/login')
      .send({
        email: userTwo.email,
        password: newPassword
      }).expect(200)
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
            .set('Authorization', `Bearer ${loginResponse.body.token}`)
            .expect(200)

        const { password, _id, tokens, ...userData } = userTwo;

        expect(accountResponse.body).toMatchObject(userData);
    });

    test('Should add admin users', async () => {
        await request(app)
            .post('/user/new')
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

        const userAdminInDb = await User.findOne({ isAdmin: true })
        expect(userAdminInDb).toBeTruthy()
    });

  test('Should not send password when retrieving user data', async () => {
    const userResponse = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .expect(200)

    expect(userResponse.body.password).toBeUndefined()
  });

  test('Should not send tokens when retrieving user data', async () => {
    const userResponse = await request(app)
      .get('/user/me')
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .expect(200)

    expect(userResponse.body.tokens).toBeUndefined()
  });

  test('Should not let non administrative users add new products', async () => {
      const { email, password } = userTwo;
      const response = await request(app)
          .post('/user/login')
          .send({ email, password })
          .expect(200);

      await request(app)
          .post('/product')
          .set('Authorization', `Bearer ${response.body.token}`)
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
    });

    test('Should verify user after clicking verification link', async () => {
        await request(app)
            .post('/user/new')
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

        const userInDb = await User.findOne({ email: 'jan@kowalski.pl' });
        expect(userInDb.verification_token).toBeDefined();
        expect(userInDb.isVerified).toBeFalsy();

        await request(app)
            .get('/user/verify/' + userInDb.verification_token)
            .expect(200);

        const userVerified = await User.findOne({ email: 'jan@kowalski.pl' });
        expect(userVerified.isVerified).toBeTruthy();
    });

    test('Should not verify user twice', async () => {
        await request(app)
            .post('/user/new')
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

        const userInDb = await User.findOne({ email: 'jan@kowalski.pl' });
        expect(userInDb.verification_token).toBeDefined();
        expect(userInDb.isVerified).toBeFalsy();

        await request(app)
            .get('/user/verify/' + userInDb.verification_token)
            .expect(200);

        const userVerified = await User.findOne({ email: 'jan@kowalski.pl' });
        expect(userVerified.isVerified).toBeTruthy();

        await request(app)
            .get('/user/verify/' + userInDb.verification_token)
            .expect(403);

        const userVerifiedSecondTime = await User.findOne({ email: 'jan@kowalski.pl' });
        expect(userVerifiedSecondTime.isVerified).toBeTruthy();
    });

    test('Should not log in unverified user', async () => {
        const userInfo = {
            name: 'Jan',
            surname: 'Kowalski',
            city: 'Łódź',
            street: 'Piotrkowska',
            house_number: '93',
            email: 'testacc@testacc.pl',
            password: 'asdf1234',
            postal_code: '12-345',
            isAdmin: true,
        };

        await request(app)
            .post('/user/new')
            .send(userInfo)
            .expect(201);

        const { email, password } = userInfo;

        const res = await request(app)
            .post('/user/login')
            .send({
                email, password
            })
            .expect(400);

        expect(JSON.parse(res.error.text).error).toBe('Error: Please authenticate your e-mail.')
    });

    test('Should log in verified user', async () => {
        const userInfo = {
            name: 'Jan',
            surname: 'Kowalski',
            city: 'Łódź',
            street: 'Piotrkowska',
            house_number: '93',
            email: 'testacc@testaxx.pl',
            password: 'asdf1234',
            postal_code: '12-345',
            isAdmin: true,
        };

        const res = await request(app)
            .post('/user/new')
            .send(userInfo)
            .expect(201);

        const { email, password } = userInfo;

        await request(app)
            .post('/user/login')
            .send({
                email, password
            })
            .expect(400);

        const userInDb = await User.findOne({ email: 'testacc@testaxx.pl' });

        await request(app)
            .get('/user/verify/' + userInDb.verification_token)
            .expect(200);

        await request(app)
            .post('/user/login')
            .send({
                email, password
            })
            .expect(200);
    });

    test('Should generate password reset token', async () => {
      await request(app)
        .get('/user/reset_password')
        .query({ email: userTwo.email })
        .expect(200)

      const user = await User.findOne({ _id: userTwo._id });
      expect(user.password_change_tokens.length).toBe(1);
      expect(user.password_change_tokens[0].password_changed_date).toBe('pending');
    })

  test('Should reset password', async () => {
    await request(app)
      .get('/user/reset_password')
      .query({ email: userTwo.email })
      .expect(200)

    const user = await User.findOne({ _id: userTwo._id });
    const userObject = await user.toObject();
    const { password_change_tokens } = userObject;
    const { token } = password_change_tokens[0];

    await request(app)
      .get(`/user/reset_password/${token}`)
      .expect(200)

    const password = 'Newpass123';

    const response = await request(app)
      .patch('/user/reset_password')
      .set('Authorization', `Bearer ${token}`)
      .send({ password })
      .expect(200);

    expect(response.body.message).toBe('Password changed successfully. You can log in now using your new password.');

    await request(app)
      .post('/user/login')
      .send({ email: userTwo.email, password })
      .expect(200);
  })


  test('Should not let reusing password reset token', async () => {
    await request(app)
      .get('/user/reset_password')
      .query({ email: userTwo.email })
      .expect(200)

    const user = await User.findOne({ _id: userTwo._id });
    const userObject = await user.toObject();
    const { password_change_tokens } = userObject;
    const { token } = password_change_tokens[0];

    await request(app)
      .patch('/user/reset_password')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'Newpass123' })
      .expect(200);

    await request(app)
      .post('/user/login')
      .send({ email: userTwo.email, password: 'Newpass123' })
      .expect(200);

    await request(app)
      .patch('/user/reset_password')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'Secondpassword123' })
      .expect(400);

  })

  test('Should decline invalid tokens', async () => {
    const res = await request(app)
      .patch('/user/reset_password')
      .set('Authorization', `Bearer somekindofbadtoken`)
      .send({ password: 'Secondpassword123' })
      .expect(400);
    expect(res.body.error).toBe( 'Invalid password reset link.' )
  })

  test('Should not generate more active token', async () => {
    await request(app)
      .get('/user/reset_password')
      .query({ email: userTwo.email })
      .expect(200)

    await request(app)
      .get('/user/reset_password')
      .query({ email: userTwo.email })
      .expect(400)
  })
});