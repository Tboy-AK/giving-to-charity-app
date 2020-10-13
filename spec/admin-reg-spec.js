const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const { createAdmin } = require('../controllers/admin-reg-controller')(errResponse, AuthModel, AdminModel);

describe('POST /api/v1.0.0/admin', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested for a new admin', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      body: {
        email: 'tester@testmail.com',
        phone: '+2348028108283',
        password: 'Password1234',
        firstName: 'Tester',
        lastName: 'Tester',
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await createAdmin(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: 'tester@testmail.com' }, () => AdminModel.deleteOne({
        firstName: 'Tester',
        lastName: 'Tester',
      }, () => done()));
    });

    it('responds status 201', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(201);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });

  describe('when requested with an existing email', () => {
    const req = {
      headers: {
        origin: 'http://sua-charity-test',
      },
      body: {
        email: 'joefrank@gmail.com',
        phone: '+2348012345678',
        password: 'Password1234',
        firstName: 'Joe',
        lastName: 'Frank',
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resSendSpy = spyOn(res, 'send');
      await createAdmin(req, res);
      done();
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: 'tester@testmail.com' }, () => AdminModel.deleteOne({
        firstName: 'Tester',
        lastName: 'Tester',
      }, () => done()));
    });

    it('responds status 403', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(403);
    });
    it('responds with an error message', () => {
      expect(resSendSpy).toHaveBeenCalled();
    });
  });
});
