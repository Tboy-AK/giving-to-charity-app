const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const { listEvents } = require('../controllers/event-controller')(errResponse, EventModel);

describe('GET /api/v1.0.0/event?page&limit|ngoId', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;

  beforeAll(async (done) => {
    await NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', (err, doc) => {
      if (err) throw err; else if (!doc) throw new Error('null');
      // eslint-disable-next-line no-underscore-dangle
      else ngoId = doc._id;
      done();
    });
  });

  describe('when requested for all NGOs', () => {
    const req = {
      query: {
        page: 0,
        limit: 10,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await listEvents(req, res);
      done();
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested for a particular NGO', () => {
    const req = {
      query: {
        page: 0,
        limit: 10,
        ngoId,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.query.ngoId = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await listEvents(req, res);
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
