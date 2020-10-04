const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const EventModel = require('../models/mongodb-models/event-model');
const AuthModel = require('../models/mongodb-models/auth-model');
const { donateItem } = require('../controllers/event-donation-controller')(errResponse, DonationModel, EventModel, AuthModel);

describe('POST /api/v1.0.0/event/:eventId/donation/?logistics=donor', () => {
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

  describe('when requested for logistics by donor', () => {
    const req = {
      query: {
        logistics: 'donor',
      },
      params: {
        eventId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with no item to be donated', () => {
    const req = {
      query: {
        logistics: 'donor',
      },
      params: {
        eventId,
      },
      body: {
        items: [],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a JSON data', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with a past date', () => {
    const req = {
      query: {
        logistics: 'donor',
      },
      params: {
        eventId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() - (3600000 * 24)).toJSON(),
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a validation error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when forced to relate donation to both NGO and event', () => {
    const req = {
      query: {
        logistics: 'donor',
      },
      params: {
        eventId,
      },
      body: {
        ngoId: eventId,
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      req.body.ngoId = await eventId;
      req.body.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a validation error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without specifying who handles logistics as a request query', () => {
    const req = {
      query: {},
      params: {
        eventId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a validation error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without a contact detail', () => {
    const req = {
      query: {
        logistics: 'donor',
      },
      params: {
        eventId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a validation error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});

describe('POST /api/v1.0.0/event/:eventId/donation/?logistics=ngo', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let eventId;

  beforeAll(async (done) => {
    await EventModel.findOne({ name: 'Child Dream Tech Power Camp 1.0' }, '_id', (err, doc) => {
      if (err) throw err; else if (!doc) throw new Error('null');
      // eslint-disable-next-line no-underscore-dangle
      else eventId = doc._id;
      done();
    });
  });

  describe('when requested for logistics by NGO with all required details', () => {
    const req = {
      query: {
        logistics: 'ngo',
      },
      params: {
        eventId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
        pickup: {
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Ọgbà',
          street: 'Ṣoníbáre',
          landmark: 'Mr. Biggs restaurant and fast food',
          address: 'Mr. Biggs, Ṣoníbáre Str., Ọgbà, Lagos.',
        },
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with a wrong logistics handler', () => {
    const req = {
      query: {
        logistics: 'somebody',
      },
      params: {
        eventId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.eventId = await eventId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a validation error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with a non-existent NGO', () => {
    const req = {
      query: {
        logistics: 'ngo',
      },
      params: {
        eventId: '5f72fd13dbff6136603e541b',
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() + (3600000 * 24 * 7)).toJSON(),
        pickup: {
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Ọgbà',
          street: 'Ṣoníbáre',
          landmark: 'Mr. Biggs restaurant and fast food',
          address: 'Mr. Biggs, Ṣoníbáre Str., Ọgbà, Lagos.',
        },
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await donateItem(req, res);
      done();
    });

    afterAll(async (done) => {
      DonationModel.deleteOne({ email: req.body.email }, () => done());
    });

    it('responds status 404', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(404);
    });
    it('responds with a validation error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
