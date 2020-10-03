const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const EventModel = require('../models/mongodb-models/event-model');
const { listDonations } = require('../controllers/event-donation-controller')(errResponse, DonationModel, EventModel);

describe('GET /api/v1.0.0/event/:eventId/donation', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let eventId;

  beforeAll(async (done) => {
    await EventModel.findOne({ name: 'Child Dream Tech Power Camp 1.0' }, '_id', (err, doc) => {
      if (err) throw err;
      // eslint-disable-next-line no-underscore-dangle
      else eventId = doc._id;
      done();
    });
  });

  describe('when requested with Event ID URL parameter', () => {
    const req = {
      params: {
        eventId,
      },
      query: {
        page: 0,
        limit: 10,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await listDonations(req, res);
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
