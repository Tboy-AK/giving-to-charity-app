const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { listDonations } = require('../controllers/ngo-donation-controller')(errResponse, DonationModel, NGOModel);

describe('GET /api/v1.0.0/ngo/:ngoId/donation', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;

  beforeAll(async (done) => {
    await NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', (err, doc) => {
      if (err) throw err;
      // eslint-disable-next-line no-underscore-dangle
      else ngoId = doc._id;
      done();
    });
  });

  describe('when requested with NGO ID URL parameter', () => {
    const req = {
      params: {
        ngoId,
      },
      query: {
        page: 0,
        limit: 10,
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
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
