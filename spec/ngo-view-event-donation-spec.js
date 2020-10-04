const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const EventModel = require('../models/mongodb-models/event-model');
const { viewDonation } = require('../controllers/event-donation-controller')(errResponse, DonationModel, EventModel);

describe('GET /api/v1.0.0/event/:eventId/donation/:donationId', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let eventId;
  let donationId;

  beforeAll(async (done) => {
    EventModel.findOne({ name: 'Child Dream Tech Power Camp 1.0' }, '_id', (eventErr, eventDoc) => {
      if (eventErr) throw eventErr; else if (!eventDoc) throw new Error('null');
      // eslint-disable-next-line no-underscore-dangle
      else eventId = eventDoc._id;
      DonationModel.findOne({ eventId }, '_id', (donationErr, donationDoc) => {
        if (donationErr) throw donationErr; else if (!donationDoc) throw new Error('null');
        // eslint-disable-next-line no-underscore-dangle
        else donationId = donationDoc._id;
        done();
      });
    });
  });

  describe('when requested with Event ID URL parameter', () => {
    const req = {
      params: {
        eventId,
        donationId,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      req.params.donationId = await donationId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await viewDonation(req, res);
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
