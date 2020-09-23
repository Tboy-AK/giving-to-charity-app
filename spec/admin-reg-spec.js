const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const { createAdmin } = require('../controllers/admin-reg-controller')(errResponse, AuthModel, AdminModel);
const logger = require('../utils/winston-logger');

describe('POST /api/v1.0.0/admin', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    json: (message) => ({ message, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested', () => {
    const req = {
      body: {
        email: 'tester@testmail.com',
        phone: '+2348028108284',
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
    const authDoc = {
      email: 'tester@testmail.com',
      password: '$2a$10$G/9RoxTzUdber2oLIgaFW.4enyOUC.Pbx.0OdGN2n2oVT00txY7gm',
      phone: '+2348028108284',
      role: 'admin',
    };
    const req = {
      body: {
        email: 'tester@testmail.com',
        phone: '+2348028108284',
        password: 'Password1234',
        firstName: 'Tester',
        lastName: 'Tester',
      },
    };
    let resStatusSpy;
    let resSendSpy;

    beforeAll(async (done) => {
      const authModel = new AuthModel(authDoc);
      authModel.save()
        .then(async () => {
          resStatusSpy = spyOn(res, 'status').and.callThrough();
          resSendSpy = spyOn(res, 'send');
          await createAdmin(req, res);
          done();
        })
        .catch((err) => {
          logger.error(err.message);
          return done();
        });
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
