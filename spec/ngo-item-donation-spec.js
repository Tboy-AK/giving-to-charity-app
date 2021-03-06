const errResponse = require('../utils/error-response-handler');
const DonationModel = require('../models/mongodb-models/donation-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { donateItem } = require('../controllers/ngo-donation-controller')(errResponse, DonationModel, NGOModel);

describe('POST /api/v1.0.0/ngo/:ngoId/donation/?logistics=donor', () => {
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

  describe('when requested for logistics by donor', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'donor',
      },
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'donor',
      },
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with a past date', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'donor',
      },
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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

  describe('when requested with pickup point', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'donor',
      },
      params: {
        ngoId,
      },
      body: {
        items: [{
          name: 'Pencil',
          desc: 'A pack of HB pencils',
        }],
        email: 'testdonor@testmail.com',
        phone: '+2347065390558',
        dateTime: new Date(Date.now() - (3600000 * 24)).toJSON(),
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
      req.params.ngoId = await ngoId;
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
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'donor',
      },
      params: {
        ngoId,
      },
      body: {
        eventId: ngoId,
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
      req.params.ngoId = await ngoId;
      req.body.eventId = await ngoId;
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
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {},
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'donor',
      },
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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

describe('POST /api/v1.0.0/ngo/:ngoId/donation/?logistics=ngo', () => {
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

  describe('when requested for logistics by NGO with all required details', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'ngo',
      },
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'somebody',
      },
      params: {
        ngoId,
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
      req.params.ngoId = await ngoId;
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
      headers: {
        origin: 'http://sua-charity-test',
      },
      query: {
        logistics: 'ngo',
      },
      params: {
        ngoId: '5f72fd13dbff6136603e541b',
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
