const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { addNeeds } = require('../controllers/ngo-needs-controller')(errResponse, NGOModel);

describe('POST /api/v1.0.0/ngo/:ngoId/need', () => {
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
      body: [
        {
          name: 'sketchpads',
          quantity: 20,
          desc: 'Notepads with blank pages for drawing',
          purpose: 'To express creative arts in the hearts of people',
        },
        {
          name: 'pillows',
          quantity: 30,
          desc: '30 pillows for beds',
          purpose: 'For displaced person of the recent Jos attacks',
        },
      ],
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.headers.useraccesspayload.authId = await authId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await addNeeds(req, res);
      done();
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with wrong authentication', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId },
      body: [],
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
      await addNeeds(req, res);
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
