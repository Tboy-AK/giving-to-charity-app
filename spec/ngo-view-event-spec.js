const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const { viewEvent } = require('../controllers/ngo-event-controller')(errResponse, NGOModel, EventModel);

describe('GET /api/v1.0.0/ngo/:ngoId/event/:eventId', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;
  let eventId;

  beforeAll(async (done) => {
    NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', (ngoErr, ngoDoc) => {
      if (ngoErr || !ngoDoc) throw ngoErr; else if (!ngoDoc) throw new Error('null');
      // eslint-disable-next-line no-underscore-dangle
      else ngoId = ngoDoc._id;
      EventModel.findOne({ ngoId }, '_id', (eventErr, eventDoc) => {
        if (eventErr) throw eventErr; else if (!eventDoc) throw new Error('null');
        // eslint-disable-next-line no-underscore-dangle
        else eventId = eventDoc._id;
        done();
      });
    });
  });

  describe('when requested with NGO ID and event ID URL parameters', () => {
    const req = {
      params: {
        ngoId,
        eventId,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
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
