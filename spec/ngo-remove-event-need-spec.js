/* eslint-disable no-underscore-dangle */
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const { removeNeed } = require('../controllers/ngo-event-needs-controller')(errResponse, EventModel);

describe('DELETE /api/v1.0.0/ngo/:ngoId/event/:eventId/need', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;
  let authId;
  let eventId;

  beforeAll(async (done) => {
    const doc = await EventModel.findOne({ name: 'Child Dream Tech Power Camp 1.0' }, '_id ngoId')
      .populate('ngoId', 'authId').catch((err) => { throw err; });
    eventId = doc._id;
    ngoId = doc.ngoId._id;
    authId = doc.ngoId.authId;
    done();
  });

  describe('when requested with an array of needs', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId, eventId },
      body: { name: 'sketchpads' },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.params.eventId = await eventId;
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
      params: { ngoId, eventId },
      body: { name: 'sketchpads' },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.params.eventId = await eventId;
      await NGOModel.findOne({ name: 'Oyok Foundation' }, '_id authId', (err, doc) => {
        if (err) throw err;
        req.headers.useraccesspayload.authId = doc.authId;
      });
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await removeNeed(req, res);
      done();
    });

    it('responds status 401', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(401);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
