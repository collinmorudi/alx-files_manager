/* eslint-disable jest/valid-expect */
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Assuming you export the Express app

const { expect } = chai;
chai.use(chaiHttp);

describe('aPI Endpoints', () => {
  describe('gET /status', () => {
    it('should return 200 with status ok', () => new Promise((done) => {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('redis');
          expect(res.body).to.have.property('db');
          done();
        });
    }));
  });

  // todo: Add tests for each endpoint similarly...
});
