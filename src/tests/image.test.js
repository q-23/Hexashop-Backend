const request = require('supertest');
const Image = require('../models/image');
const app = require('../app');
const crypto = require('crypto');
const fs = require('fs')
const { setupImages, userOne } = require('./fixtures/db')

let adminAuthToken = '';

const adminUserLogin = () => {
	return request(app)
		.post('/user/login')
		.send({email: userOne.email, password: userOne.password})
};

beforeEach(async (done) => {
	await setupImages();
    const adminRes = await adminUserLogin();
	adminAuthToken = adminRes.body.user.tokens[0].token;
	done()
});

beforeEach(setupImages);

describe('[IMAGE] - ', () => {
    test('Should get images', async () => {
        const main_img = await Image.findOne({ main: true });

        const image = await request(app)
            .get(`/image/${main_img._id}`)
            .expect(200);

        expect(image.header['content-type']).toBe('image/png');
    });

    test('Should delete images', async () => {
        const image = await Image.findOne({ description: 'Lorem ipsum' });

        await request(app)
            .delete(`/image/${image._id}`)
            .set('Authorization', `Bearer ${adminAuthToken}`)


        const imageFound = await Image.findById(image._id);
        expect(imageFound).toBeNull();
    });

    test('Should edit images', async () => {
        const image = await Image.findOne({ main: false });

        await request(app)
            .patch(`/image/${image._id}`)
            .set('Authorization', `Bearer ${adminAuthToken}`)
            .field('description', 'new desc')
            .attach('image', './src/tests/fixtures/imgtest.png')
            .expect(200);

        const returnChecksum = file => {
            return crypto
                .createHash('md5')
                .update(file, 'utf8')
                .digest('hex')
        }

        const imageEdited = await Image.findById(image._id);
        const newImageChecksum = returnChecksum(fs.readFileSync(__dirname + '/fixtures/imgtest.png'));
        expect(returnChecksum(imageEdited.image)).toBe(newImageChecksum);
        expect(imageEdited.description).toBe('new desc');
    });
})