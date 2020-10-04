const errResponse = require('../utils/error-response-handler');
const SubscriberModel = require('../models/mongodb-models/subscriber-model');
const EventModel = require('../models/mongodb-models/event-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { createSubscriber } = require('../controllers/subscriber-controller')(errResponse, SubscriberModel, EventModel, NGOModel);

describe('POST /api/v1.0.0/subscriber', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;

  beforeAll(async (done) => {
    NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', async (err, doc) => {
      if (err) throw err; else if (!doc) throw new Error('null');
      // eslint-disable-next-line no-underscore-dangle
      else ngoId = doc._id;
      done();
    });
  });

  describe('when requested with all appropriate details', () => {
    const req = {
      body: {
        email: 'subtester@testmail.com',
        sdgs: [1, 4],
        ngos: [ngoId],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.body.ngos[0] = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createSubscriber(req, res);
      done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without NGOs', () => {
    const req = {
      body: {
        email: 'subtester@testmail.com',
        sdgs: [1, 4],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createSubscriber(req, res);
      return done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without SDGs', () => {
    const req = {
      body: {
        email: 'subtester@testmail.com',
        ngos: [ngoId],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.body.ngos[0] = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createSubscriber(req, res);
      done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without NGOs and SDGs', () => {
    const req = {
      body: {
        email: 'subtester@testmail.com',
        sdgs: [],
        ngos: [],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await createSubscriber(req, res);
      done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
