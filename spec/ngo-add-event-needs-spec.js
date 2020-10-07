/* eslint-disable no-underscore-dangle */
const errResponse = require('../utils/error-response-handler');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const { addNeeds } = require('../controllers/ngo-event-needs-controller')(errResponse, EventModel);

describe('POST /api/v1.0.0/ngo/:ngoId/event/:eventId/need', () => {
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
      body: [
        {
          name: 'sketchpads',
          quantity: 20,
          desc: 'Notepads with blank pages for drawing',
          purpose: 'To express creative arts in the hearts of people',
        },
        {
          name: 'pillows',
          quantity: 30,
          desc: '30 pillows for beds',
          purpose: 'For displaced person of the recent Jos attacks',
        },
      ],
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      req.params.eventId = await eventId;
      req.headers.useraccesspayload.authId = await authId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await addNeeds(req, res);
      done();
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with wrong authentication', () => {
    const req = {
      headers: { useraccesspayload: { authId } },
      params: { ngoId, eventId },
      body: [
        {
          name: 'sketchpads',
          quantity: 20,
          desc: 'Notepads with blank pages for drawing',
          purpose: 'To express creative arts in the hearts of people',
        },
        {
          name: 'pillows',
          quantity: 30,
          desc: '30 pillows for beds',
          purpose: 'For displaced person of the recent Jos attacks',
        },
      ],
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
      await addNeeds(req, res);
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
