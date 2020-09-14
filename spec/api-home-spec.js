const request = require('postman-request');
require('dotenv').config();
require('../server');

const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;
const version = process.env.VERSION || 'v1.0.0';
const uri = `http://${hostname}:${port}/api/${version}/`;

describe('GET /api/v1.0.0', () => {
  describe('when requested', () => {
    const response = {};
    beforeAll(async (done) => {
      request(uri, (err, res, body) => {
        response.status = res.statusCode;
        response.body = body;
        done();
      });
    });
    it('responds status 200', async (done) => {
      expect(await response.status).toEqual(200);
      done();
    });
    it('responds with an object body', async (done) => {
      expect(await typeof response.body).toBe('string');
      done();
    });
  });
});
