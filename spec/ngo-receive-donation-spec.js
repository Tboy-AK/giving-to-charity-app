/* eslint-disable no-underscore-dangle */
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const DonationModel = require('../models/mongodb-models/donation-model');
const { receiveDonation } = require('../controllers/ngo-donation-controller')(errResponse, DonationModel, NGOModel);

describe('POST /api/v1.0.0/ngo/:ngoId/donation/:donationId/received', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let donationId;
  let ngoId;
  let authId;

  beforeAll(async (done) => {
    const doc = await DonationModel
      .findOne({ email: 'danarey@gmail.com', ngoId: { $ne: null } }, '_id ngoId')
      .populate('ngoId', 'authId')
      .catch((err) => err);
    donationId = doc._id;
    ngoId = doc.ngoId._id;
    authId = doc.ngoId.authId;
    done();
  });

  describe('when requested by the authorised NGO', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId, donationId },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.params.donationId = await donationId;
      req.headers.useraccesspayload.authId = await authId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await receiveDonation(req, res);
      done();
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with unauthorised access', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId, donationId },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.params.donationId = await donationId;
      await NGOModel
        .findOne({ name: 'Oyok Foundation' }, '_id authId', (err, doc) => {
          if (err) throw err;
          req.headers.useraccesspayload.authId = doc.authId;
        });
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await receiveDonation(req, res);
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
