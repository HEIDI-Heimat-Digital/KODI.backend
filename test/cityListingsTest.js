const chai = require('chai');
const expect = chai.expect;

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const { describe, before, after, it } = require('mocha');

const rewire = require('rewire');
const path = require("path");

const {open} = require("sqlite");
const coreDbPath = path.join(__dirname, 'test.db');
const cityDbPath = path.join(__dirname, 'city-1.db');
const sqlite3 = require('sqlite3').verbose();

const mockConnection = require('./mockDBServices/mockConnection')

const database = rewire('./../services/database');
database.__set__('getConnection', mockConnection.getConnection);

const cityListingsRouter = rewire('./../routes/cityListings');
cityListingsRouter.__set__('database', database);

const indexFile = rewire('./testServer');
indexFile.__set__('cityListingsRouter', cityListingsRouter);

describe('City Listing Endpoints Test', () => {
    let coreDb;
    let cityDb;
    let app;
    let server;

    before(async () => {
        coreDb = await open({
            filename: coreDbPath,
            driver: sqlite3.Database,
        });
        cityDb = await open({
            filename: cityDbPath,
            driver: sqlite3.Database,
        });
        server = new indexFile.Server();
        app = server.init();
    });

    after(async () => {
        await server.close();
        await coreDb.close();
        await cityDb.close();
    });

    it('get api', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .get('/cities/1/listings/')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

    it('get api 2', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .get('/cities/1/listings/1')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

    it('post api', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .post('/cities/1/listings/')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

    it('patch', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .patch('/cities/1/listings/1')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

    it('delete', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .delete('/cities/1/listings/1')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

    it('post image', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .post('/cities/1/listings/1/imageUpload')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

    it('delete image', (done) => {
        let expectedData;

        coreDb.all('SELECT id, name, image FROM cities')
            .then((dbResponse) => {
                expectedData = dbResponse.map((item) => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                }));

                return chai.request(app)
                    .delete('/cities/1/listings/1/imageDelete')
                    .send();
            })
            .then((res) => {
                const responseData = res.body.data;
                expect(res).to.have.status(200);

                // Sort both arrays by id for comparison
                responseData.sort((a, b) => a.id - b.id);
                expectedData.sort((a, b) => a.id - b.id);
                expect(res.body.status).to.equal('success');
                expect(responseData).to.deep.equal(expectedData);
                done();
            })
    });

});
