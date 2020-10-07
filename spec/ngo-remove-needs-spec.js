const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { removeNeed } = require('../controllers/ngo-needs-controller')(errResponse, NGOModel);

describe('DELETE /api/v1.0.0/ngo/:ngoId/need', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;
  let authId;

  beforeAll(async (done) => {
    await NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id authId', (err, doc) => {
      if (err) throw err;
      // eslint-disable-next-line no-underscore-dangle
      ngoId = doc._id;
      authId = doc.authId;
      done();
    });
  });

  describe('when requested with an array of needs', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId },
      body: { name: 'sketchpads' },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.headers.useraccesspayload.authId = await authId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await removeNeed(req, res);
      done();
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with wrong authentication', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId },
      body: { name: 'sketchpads' },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      await NGOModel.findOne({ name: 'Oyok Foundation' }, '_id authId', (err, doc) => {
        if (err) throw err;
        // eslint-disable-next-line no-underscore-dangle
        req.headers.useraccesspayload.authId = doc.authId;
      });
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await removeNeed(req, res);
      done();
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
