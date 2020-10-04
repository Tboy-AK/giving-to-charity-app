const errResponse = require('../utils/error-response-handler');
const logger = require('../utils/winston-logger');
const NGOModel = require('../models/mongodb-models/ngo-model');
const EventModel = require('../models/mongodb-models/event-model');
const { createEvent } = require('../controllers/ngo-event-controller')(errResponse, NGOModel, EventModel);

describe('POST /api/v1.0.0/ngo/:ngoId/event', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  let ngoId;

  beforeAll(async (done) => {
    NGOModel.findOne({ name: 'Child Dreams Foundation' }, '_id', async (err, doc) => {
      if (err) throw err; else if (!doc) throw new Error('null');
      // eslint-disable-next-line no-underscore-dangle
      else ngoId = await doc._id;
      done();
    });
  });

  describe('when requested with all appropriate details', () => {
    const req = {
      headers: {
        useraccesspayload: {
          email: 'childdreamsfoundation@gmail.com',
        },
      },
      params: { ngoId },
      body: {
        name: 'NGT Season 4: Engagement Phase',
        dateTime: '2020-11-21T12:30:00',
        desc: "The participants create videos about a book they've read for the week. Participants are graded by their age range. The winners of each age range win a 10,000 Naira voucher from Laterna",
        mission: 'To encourage the reading culture in the African child',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        sdg: 1,
        socialMedia: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        onlinePlatforms: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        venue: {
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Agege',
          address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
          zipCode: 100283,
        },
        needs: [
          {
            name: 'Inspirational novels',
          },
        ],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      createEvent(req, res)
        .then(() => done())
        .catch((err) => {
          logger.error(err.message);
          return done();
        });
    });

    afterAll(async (done) => {
      EventModel.deleteOne({ name: req.body.name }, () => done());
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without both online platform and physical venue', () => {
    const req = {
      headers: {
        useraccesspayload: {
          email: 'childdreamsfoundation@testmail.com',
        },
      },
      params: { ngoId },
      body: {
        name: 'NGT Season 4: Engagement Phase',
        dateTime: '2020-11-21T12:30:00',
        desc: "The participants create videos about a book they've read for the week. Participants are graded by their age range. The winners of each age range win a 10,000 Naira voucher from Laterna",
        mission: 'To encourage the reading culture in the African child',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        sdg: 1,
        socialMedia: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        needs: [
          {
            name: 'Inspirational novels',
          },
        ],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      createEvent(req, res)
        .then(() => done())
        .catch((err) => {
          logger.error(err.message);
          return done();
        });
    });

    afterAll(async (done) => {
      EventModel.deleteOne({ name: req.body.name }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with zip code as string', () => {
    const req = {
      headers: {
        useraccesspayload: {
          email: 'childdreamsfoundation@testmail.com',
        },
      },
      params: { ngoId },
      body: {
        name: 'NGT Season 4: Engagement Phase',
        dateTime: '2020-11-21T12:30:00',
        desc: "The participants create videos about a book they've read for the week. Participants are graded by their age range. The winners of each age range win a 10,000 Naira voucher from Laterna",
        mission: 'To encourage the reading culture in the African child',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        sdg: 1,
        socialMedia: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        onlinePlatforms: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        venue: {
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Agege',
          address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
          zipCode: 'A100283',
        },
        needs: [
          {
            name: 'Inspirational novels',
          },
        ],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      createEvent(req, res)
        .then(() => done())
        .catch((err) => {
          logger.error(err.message);
          return done();
        });
    });

    afterAll(async (done) => {
      EventModel.deleteOne({ name: req.body.name }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested by NGO with existing event', () => {
    const req = {
      headers: {
        useraccesspayload: {
          email: 'childdreamsfoundation@testmail.com',
        },
      },
      params: { ngoId },
      body: {
        name: 'NGT Season 4: Engagement Phase',
        dateTime: '2020-11-21T12:30:00',
        desc: "The participants create videos about a book they've read for the week. Participants are graded by their age range. The winners of each age range win a 10,000 Naira voucher from Laterna",
        mission: 'To encourage the reading culture in the African child',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        sdg: 1,
        socialMedia: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        onlinePlatforms: [
          {
            name: 'Twitter',
            url: 'https://twitter.com/SNurturing',
          },
        ],
        venue: {
          country: 'Nigeria',
          state: 'Lagos',
          city: 'Agege',
          address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
          zipCode: 100283,
        },
        needs: [
          {
            name: 'Inspirational novels',
          },
        ],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      req.params.ngoId = await ngoId;
      const eventModel = new EventModel({ ...req.body, ...req.params });
      await eventModel.save().catch((err) => logger.error(err.message));
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await createEvent(req, res).catch((err) => logger.error(err.message));
      done();
    });

    afterAll(async (done) => {
      EventModel.deleteOne({ name: req.body.name }, () => done());
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
