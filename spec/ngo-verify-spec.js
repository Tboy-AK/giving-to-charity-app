/* eslint-disable no-underscore-dangle */
const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { adminVerifyNGO } = require('../controllers/ngo-reg-controller')(errResponse, AuthModel, NGOModel);

describe('GET /api/v1.0.0/ngo/:ngoId/verify', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;
  let verifiedNGOId;

  beforeAll(async (done) => {
    await NGOModel
      .findOne({ name: 'Oyok Foundation', verified: false }, '_id')
      .then((doc) => { ngoId = doc._id; })
      .catch((err) => { throw err; });
    await NGOModel
      .findOne({ name: 'Child Dreams Foundation', verified: true }, '_id')
      .then((doc) => { verifiedNGOId = doc._id; })
      .catch((err) => { throw err; });
    done();
  });

  describe('when requested with NGO ID URL parameter', () => {
    const req = { params: { ngoId } };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await adminVerifyNGO(req, res);
      done();
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with NGO ID URL parameter', () => {
    const req = { params: { verifiedNGOId } };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.verifiedNGOId = await verifiedNGOId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await adminVerifyNGO(req, res);
      done();
    });

    it('responds status 404', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(404);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
