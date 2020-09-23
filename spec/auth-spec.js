const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { userSignin } = require('../controllers/auth-controller')(
  errResponse, AuthModel, { AdminModel, NGOModel },
);
const logger = require('../utils/winston-logger');

describe('POST /api/v1.0.0/auth', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    header: (params) => ({ ...params, ...res }),
    cookie: (data) => ({ data, ...res }),
    json: (data) => ({ ...data, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested', () => {
    const req = {
      body: {
        email: 'tester@testmail.com',
        password: 'Password1234',
      },
    };
    const authDoc = {
      email: req.body.email,
      password: '$2a$10$G/9RoxTzUdber2oLIgaFW.4enyOUC.Pbx.0OdGN2n2oVT00txY7gm',
      phone: '+2348028108284',
      role: 'admin',
    };
    const adminDoc = {
      firstName: 'Tobi',
      lastName: 'Akanji',
      authId: '',
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      const authModel = new AuthModel(authDoc);
      authModel.save(async (authErr, authProduct) => {
        if (authErr) {
          logger.error(authErr.message);
          return done();
        }

        // eslint-disable-next-line no-underscore-dangle
        adminDoc.authId = authProduct._id;
        const adminModel = new AdminModel(adminDoc);
        return adminModel.save(async (adminErr) => {
          if (adminErr) {
            logger.error(adminErr.message);
            return done();
          }
          resStatusSpy = spyOn(res, 'status').and.callThrough();
          resJSONSpy = spyOn(res, 'json');
          await userSignin(req, res);
          return done();
        });
      });
    });

    afterAll(async (done) => {
      AuthModel.deleteOne({ email: authDoc.email }, () => AdminModel
        .deleteOne({ authId: adminDoc.authId }, () => done()));
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });
});
