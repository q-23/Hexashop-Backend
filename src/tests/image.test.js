const request = require('supertest');
const Image = require('../models/image');
const app = require('../app');

const { setupImages } = require('./fixtures/db')

beforeEach(setupImages);

describe('[IMAGE] - ', () => {
    test('Should get images', async () => {
        const main_img = await Image.findOne({ main: true });

        const image = await request(app)
            .get(`/image/${main_img._id}`)
            .expect(200);

        expect(image.header['content-type']).toBe('image/png');
    })
})