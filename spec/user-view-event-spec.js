/* eslint-disable no-underscore-dangle */
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const { viewEvent } = require('../controllers/event-controller')(errResponse, EventModel);

describe('GET /api/v1.0.0/event/:eventId', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let eventId;

  beforeAll(async (done) => {
    NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', (ngoErr, ngoDoc) => {
      if (ngoErr || !ngoDoc) throw ngoErr; else if (!ngoDoc) throw new Error('null');

      EventModel.findOne({ ngoId: ngoDoc._id }, '_id', (eventErr, eventDoc) => {
        if (eventErr) throw eventErr; else if (!eventDoc) throw new Error('null');
        else eventId = eventDoc._id;
        done();
      });
    });
  });

  describe('when requested with NGO ID and event ID URL parameters', () => {
    const req = {
      params: {
        eventId,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await viewEvent(req, res);
      done();
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });
});
