const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');
const request = require('supertest');

const healthCheckController = require('../controllers/health.controller');
const itemController = require('../controllers/item.controller');

const sandbox = sinon.createSandbox();

let app = rewire('../app');

describe('Testing app routes', () => {

    let hash, demoItem;

    afterEach(() => {
        app = rewire('../app');
        sandbox.restore();
    });

    describe('Testing /item route', () => {


        beforeEach(() => {
            hash = '1234567891';
            demoItem = {
                name: 'abc',
                rating: 8,
                price: 150,
                hash: hash
            };

            sandbox.stub(itemController, 'readItem').resolves(demoItem);
            sandbox.stub(itemController, 'createItem').resolves(demoItem);
            sandbox.stub(itemController, 'updateItemHash').resolves(demoItem);
        })

        it('GET /:hash should successfully return item', (done) => {
            request(app).get(`/item/${hash}`)
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('message').to.equal('Item read successfully!');
                    expect(response.body).to.have.property('item').to.have.property('name').to.equal('abc');
                    expect(response.body).to.have.property('item').to.have.property('price').to.equal(150);
                    expect(response.body).to.have.property('item').to.have.property('rating').to.equal(8);
                    expect(response.body).to.have.property('item').to.have.property('hash').to.equal(hash);
                    done(err); // err is null in success scenario
                });
        });

        it('POST / should successfully create a new item', (done) => {
            request(app).post('/item/')
                .send(demoItem)
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('message').to.equal('Item created successfully!');
                    expect(response.body).to.have.property('item').to.have.property('name').to.equal('abc');
                    expect(response.body).to.have.property('item').to.have.property('price').to.equal(150);
                    expect(response.body).to.have.property('item').to.have.property('rating').to.equal(8);
                    expect(response.body).to.have.property('item').to.have.property('hash').to.equal(hash);
                    done(err);
                });
        });

        it('PUT / should successfully update hash for a given item', (done) => {
            request(app).put('/item')
                .send(hash)
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('message').to.equal('Item updated successfully!');
                    expect(response.body).to.have.property('item').to.have.property('name').to.equal('abc');
                    expect(response.body).to.have.property('item').to.have.property('price').to.equal(150);
                    expect(response.body).to.have.property('item').to.have.property('rating').to.equal(8);
                    expect(response.body).to.have.property('item').to.have.property('hash').to.equal(hash);
                    done(err);
                });
        });

    })

    describe('GET /health', () => {
        beforeEach(() => {
            sandbox.stub(healthCheckController, 'healthCheckSync').returns('OK');
            sandbox.stub(healthCheckController, 'healthCheckAsync').resolves('OK');
        });

        it('/sync should succeed', (done) => {
            request(app).get('/health/sync')
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('health').to.equal('OK');
                    done(err);
                });
        });

        it('/async should succeed', (done) => {
            request(app).get('/health/async')
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('health').to.equal('OK');
                    done(err);
                });
        });
    });
})