const { Types } = require('mongoose');
const errResponse = require('../utils/error-response-handler');
const SubscriberModel = require('../models/mongodb-models/subscriber-model');
const EventModel = require('../models/mongodb-models/event-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { unsubscribe } = require('../controllers/subscriber-controller')(errResponse, SubscriberModel, EventModel, NGOModel);

describe('DELETE /api/v1.0.0/subscriber', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested for a subscriber', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      params: { subscriberId: '' },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      await SubscriberModel.findOne({ email: 'danfritzby@gmail.com' }, '_id', async (err, doc) => {
        if (err) throw err; else if (!doc) throw new Error('null');
        // eslint-disable-next-line no-underscore-dangle
        else req.params.subscriberId = doc._id;
      });
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await unsubscribe(req, res);
      done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.params.email }, () => done());
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested for one who has unsubscribed', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      params: { subscriberId: '' },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      await SubscriberModel.findOne({ email: 'sanfrancis@gmail.com' }, '_id', async (err, doc) => {
        if (err) throw err; else if (!doc) throw new Error('null');
        // eslint-disable-next-line no-underscore-dangle
        else req.params.subscriberId = doc._id;
      });
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await unsubscribe(req, res);
      done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.params.email }, () => done());
    });

    it('responds status 401', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(401);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested for one who hasn\'t subscribed at all', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      params: { subscriberId: '' },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.subscriberId = Types.ObjectId().toHexString();
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await unsubscribe(req, res);
      done();
    });

    afterAll(async (done) => {
      SubscriberModel.deleteOne({ email: req.params.email }, () => done());
    });

    it('responds status 401', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(401);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
