const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { viewDonation } = require('../controllers/ngo-donation-controller')(errResponse, DonationModel, NGOModel);

describe('GET /api/v1.0.0/ngo/:ngoId/donation/:donationId', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;
  let donationId;

  beforeAll(async (done) => {
    NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', (ngoErr, ngoDoc) => {
      if (ngoErr) throw ngoErr;
      // eslint-disable-next-line no-underscore-dangle
      else ngoId = ngoDoc._id;
      DonationModel.findOne({ ngoId }, '_id', (donationErr, donationDoc) => {
        if (donationErr) throw donationErr;
        // eslint-disable-next-line no-underscore-dangle
        else donationId = donationDoc._id;
        done();
      });
    });
  });

  describe('when requested with NGO ID URL parameter', () => {
    const req = {
      params: {
        ngoId,
        donationId,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
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
