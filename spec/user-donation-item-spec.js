require('dotenv').config();
const errResponse = require('../utils/error-response-handler');
const ProhibitedDonationItemModel = require('../models/mongodb-models/prohibited-donation-item-model');
const EventModel = require('../models/mongodb-models/event-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { getSuggestions } = require('../controllers/user-donation-item-controller')(errResponse, ProhibitedDonationItemModel, EventModel, NGOModel);

describe('POST /api/v1.0.0/donation_item', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  const { DOMAIN } = process.env;

  xdescribe('when requested for a list of items', () => {
    const req = {
      headers: { origin: `http://${DOMAIN}` },
      body: [
        {
          name: 'Shoes',
          quantity: 1,
          unit: 'pair',
          desc: 'A pair of black girls shoes. Size 29',
          purpose: '',
        },
        {
          name: 'School bag',
          quantity: 2,
          unit: 'piece',
          desc: '',
          purpose: '',
        },
        {
          name: 'Notebooks',
          quantity: 1,
          unit: 'pack',
          desc: 'A bicycle ridable by middlschool kids and above',
          purpose: '',
        },
      ],
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await getSuggestions(req, res);
      done();
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with a prohibited item', () => {
    const req = {
      headers: { origin: `http://${DOMAIN}` },
      body: [
        {
          name: 'Shoes',
          quantity: 1,
          unit: '',
          desc: 'A pair of black girls shoes. Size 29',
          purpose: '',
        },
        {
          name: 'School bag',
          quantity: 2,
          unit: '',
          desc: '',
          purpose: '',
        },
        {
          name: 'Gun',
          quantity: 1,
          unit: '',
          desc: '',
          purpose: '',
        },
      ],
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await getSuggestions(req, res);
      done();
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with name as an array', () => {
    const req = {
      headers: { origin: `http://${DOMAIN}` },
      body: [
        {
          name: ['Shoes'],
          quantity: 1,
          unit: 'pair',
          desc: 'A pair of black girls shoes. Size 29',
          purpose: '',
        },
        {
          name: ['School bag'],
          quantity: 2,
          unit: 'piece',
          desc: '',
          purpose: '',
        },
        {
          name: ['Notebooks'],
          quantity: 1,
          unit: 'pack',
          desc: 'A bicycle ridable by middlschool kids and above',
          purpose: '',
        },
      ],
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await getSuggestions(req, res);
      done();
    });

    it('responds status 500', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(500);
    });
    it('responds as an internal server error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
