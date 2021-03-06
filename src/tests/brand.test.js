const request = require('supertest');
const Brand = require('../models/brand');
const Product = require('../models/product');
const app = require('../app');
const { setupProducts, userOne } = require('./fixtures/db')

beforeEach(setupProducts)

const { token } = userOne.tokens[0];

describe('[BRAND] - ', () => {
    test('Should add brand', async () => {
        const response = await request(app)
            .post('/brand')
            .set('Authorization', `Bearer ${token}`)
            .send({
                brand_name: 'Marka pierwsza',
                brand_path: '/path'
            })
            .expect(201)

        const brandFound = await Brand.findById(response.body._id)
        expect(brandFound).toBeTruthy()
    });

    test('Should send brands count', async () => {
        const response = await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .send({
              brand_name: 'Marka pierwsza',
              brand_path: '/path'
          })
          .expect(201)

        const brandFound = await Brand.findById(response.body._id)
        expect(brandFound).toBeTruthy();

        const allBrandsResponse = await request(app)
          .get('/brand')
          .expect(200);
        expect(allBrandsResponse.body.count).toBe(3)
    });

    test('Should create links to brand images before saving', async () => {
        const response = await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .attach('brand_image', './src/tests/fixtures/imgtest.png')
          .field('brand_name', 'Brand')
          .field('brand_path', '/brand')
          .expect(201)
        const brandFound = await Brand.findById(response.body._id);
        expect(String(brandFound.brand_image_link).startsWith(process.env.HOST_URL)).toBeTruthy()
    });

    test('Should delete brand image when deleting brand', async () => {
        const response = await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .attach('brand_image', './src/tests/fixtures/imgtest.png')
          .field('brand_name', 'Brand')
          .field('brand_path', '/brand')
          .expect(201)
        const brandFound = await Brand.findById(response.body._id);
        expect(brandFound).toBeTruthy();
        const { _id } = brandFound;
        const brandImageId = brandFound.brand_image_link.split('/').pop();
        await request(app)
          .delete('/brand/' + _id)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        const brandFoundAfterDelete = await Brand.findById(response.body._id);
        expect(brandFoundAfterDelete).toBeNull();
        await request(app).get('/image/' + brandImageId).expect(404)
    })

    test('Should add brand images', async () => {
        const response = await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .attach('brand_image', './src/tests/fixtures/imgtest.png')
          .field('brand_name', 'Brand')
          .field('brand_path', '/brand')
          .expect(201);

        const brandFound = await Brand.findById(response.body._id)
        expect(brandFound.brand_image).toBeTruthy()
    });

    test('Should add slugified brand paths when none is provided', async () => {
        await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .send({
              brand_name: 'Kategoria pierwsza'
          })
          .expect(201)

        const brand = await Brand.findOne({brand_name: 'Kategoria pierwsza'});

        expect(brand.brand_path).toBe('/kategoria-pierwsza')
    });

    test("Should get brand and it's products", async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka piąta' });
        const brandTwo = await Brand.findOne({ brand_name: 'Marka druga' });

        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'c', description: 'd', price: 23, brand: brandTwo._id }).save();

        const categoryResponse = await request(app)
            .get(`/brand/${brand._id}`)
            .expect(200)

        expect(categoryResponse.body.brand_name).toBe('Marka piąta');
        expect(categoryResponse.body.products.length).toBe(1)
    });

    test("Should use pagination when fetching brand products and send items count", async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka piąta' });

        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();
        await new Product({ name: 'a', description: 'b', price: 23, brand: brand._id }).save();

        const categoryResponse = await request(app)
          .get(`/brand/${brand._id}`)
          .expect(200)

        expect(categoryResponse.body.brand_name).toBe('Marka piąta');
        expect(categoryResponse.body.products.length).toBe(8);
        expect(categoryResponse.body.count).toBe(8);

        const categoryResponse2 = await request(app)
          .get(`/brand/${brand._id}`)
          .query({limit: 5, skip: 5})
          .expect(200)

        expect(categoryResponse2.body.brand_name).toBe('Marka piąta');
        expect(categoryResponse2.body.products.length).toBe(3);
        expect(categoryResponse2.body.count).toBe(8);
    });

    test('Should get all brands', async () => {
        const response = await request(app)
            .get('/brand')
            .expect(200);

        expect(response.body.count).toBe(2);
        expect(response.body.brands.length).toBe(2);
    });

    test('Should use pagination when fetching brands', async () => {
        await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .send({
              brand_name: 'Marka pierdwsza',
              brand_path: '/paath'
          })

        await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .send({
              brand_name: 'Marka pieasrwsza',
              brand_path: '/padth'
          })

        await request(app)
          .post('/brand')
          .set('Authorization', `Bearer ${token}`)
          .send({
              brand_name: 'Marka piętnasta',
              brand_path: '/pfath'
          })

        const response = await request(app)
          .get('/brand')
          .query({limit: 3, skip: 4})
          .expect(200);

        expect(response.body.count).toBe(5);
        expect(response.body.brands.length).toBe(1);
    });

    test('Should delete brand and update linked products brand array', async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka piąta' });

        const product = await new Product({ name: 'a', description: 'b', price: 23, brand_name: brand._id }).save();

        await request(app)
            .delete(`/brand/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const productRequest = await Product.findById(product._id);
        expect(productRequest.brand_name).toBeFalsy();
    });

    test('Should update brand', async () => {
        const brand = await Brand.findOne({ brand_name: 'Marka piąta' });

        const brandUpdated = await request(app)
            .patch(`/brand/${brand._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ brand_name: 'Marka trzecia',
                brand_path: '/path'
            })
            .expect(201);

        expect(brandUpdated.body.brand_name).toBe('Marka trzecia');
    });
})