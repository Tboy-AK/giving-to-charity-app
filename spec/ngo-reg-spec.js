const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { createNGO } = require('../controllers/ngo-reg-controller')(errResponse, AuthModel, NGOModel);

describe('POST /api/v1.0.0/ngo', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested with all appropriate details', () => {
    const req = {
      body: {
        email: 'ngt@testmail.com',
        phone: '+2348074289936',
        password: 'Password1234',
        name: 'Nuruturing God\'s Treasures',
        mission: 'Raising the genius in the African',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Agege',
        address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
        cacNumber: '100283',
        zipCode: 100283,
        sdgs: [1, 4],
        socialMedia: [{ name: 'Twitter', url: 'https://twitter.com/SNurturing' }],
        needs: [{ name: 'Loudspeaker' }],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createNGO(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: req.body.email }, () => NGOModel.deleteOne({
        name: req.body.name,
      }, () => done()));
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested without needs', () => {
    const req = {
      body: {
        email: 'ngt@testmail.com',
        phone: '+2348074289936',
        password: 'Password1234',
        name: 'Nuruturing God\'s Treasures',
        mission: 'Raising the genius in the African',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Agege',
        address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
        cacNumber: '100283',
        zipCode: 100283,
        sdgs: [1, 4],
        socialMedia: [{ name: 'Twitter', url: 'https://twitter.com/SNurturing' }],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createNGO(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: req.body.email }, () => NGOModel.deleteOne({
        name: req.body.name,
      }, () => done()));
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with unrecognised social media account', () => {
    const req = {
      body: {
        email: 'ngt@testmail.com',
        phone: '+2348074289936',
        password: 'Password1234',
        name: 'Nuruturing God\'s Treasures',
        mission: 'Raising the genius in the African',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Agege',
        address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
        cacNumber: '100283',
        zipCode: 100283,
        sdgs: [1, 4],
        socialMedia: [{ name: 'Voodoo', url: 'https://twitter.com/SNurturing' }],
        needs: [{ name: 'Loudspeaker' }],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await createNGO(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: req.body.email }, () => NGOModel.deleteOne({
        name: req.body.name,
      }, () => done()));
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a user error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with wrong data type in SDGs field', () => {
    const req = {
      body: {
        email: 'ngt@testmail.com',
        phone: '+2348074289936',
        password: 'Password1234',
        name: 'Nuruturing God\'s Treasures',
        mission: 'Raising the genius in the African',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Agege',
        address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
        cacNumber: '100283',
        zipCode: 100283,
        sdgs: [true, 4],
        socialMedia: [{ name: 'Twitter', url: 'https://twitter.com/SNurturing' }],
        needs: [{ name: 'Loudspeaker' }],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await createNGO(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: req.body.email }, () => NGOModel.deleteOne({
        name: req.body.name,
      }, () => done()));
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a string error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with wrong data type in zip code field', () => {
    const req = {
      body: {
        email: 'ngt@testmail.com',
        phone: '+2348074289936',
        password: 'Password1234',
        name: 'Nuruturing God\'s Treasures',
        mission: 'Raising the genius in the African',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Agege',
        address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
        cacNumber: '100283',
        zipCode: 'A100283',
        sdgs: [1, 4],
        socialMedia: [{ name: 'Twitter', url: 'https://twitter.com/SNurturing' }],
        needs: [{ name: 1 }],
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await createNGO(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: req.body.email }, () => NGOModel.deleteOne({
        name: req.body.name,
      }, () => done()));
    });

    it('responds status 400', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(400);
    });
    it('responds with a string error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with empty needs', () => {
    const req = {
      body: {
        email: 'ngt@testmail.com',
        phone: '+2348074289936',
        password: 'Password1234',
        name: 'Nuruturing God\'s Treasures',
        mission: 'Raising the genius in the African',
        vision: 'We see an Africa where chidren grow up to be higly incomparable to their peers',
        website: 'http://ngt-web-develop.herokuapp.com/',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Agege',
        address: 'Ijaiye MHE, off Agege Stadium, Agege-Ogba, Lagos, Nigeria.',
        cacNumber: '100283',
        zipCode: 100283,
        sdgs: [1, 4],
        socialMedia: [{ name: 'Twitter', url: 'https://twitter.com/SNurturing' }],
        needs: [],
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createNGO(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: req.body.email }, () => NGOModel.deleteOne({
        name: req.body.name,
      }, () => done()));
    });

    it('responds status 201, unfortunately', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data, unfortunately', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });
});
