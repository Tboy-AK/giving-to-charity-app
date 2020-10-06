const errResponse = require('../utils/error-response-handler');
const AuthModel = require('../models/mongodb-models/auth-model');
const AdminModel = require('../models/mongodb-models/admin-model');
const NGOModel = require('../models/mongodb-models/ngo-model');
const { userSignout } = require('../controllers/auth-controller')(
  errResponse, AuthModel, { AdminModel, NGOModel },
);

describe('POST /api/v1.0.0/auth/access', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    clearCookie: (data) => ({ data, ...res }),
    removeHeader: (params) => ({ ...params, ...res }),
    json: (data) => ({ ...data, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested by a registered user', () => {
    const req = {
      body: {
        email: 'joefrank@gmail.com',
        password: 'Password1234',
      },
    };
    let resStatusSpy;
    let resCookieSpy;
    let resHeaderSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resCookieSpy = spyOn(res, 'clearCookie').and.callThrough();
      resHeaderSpy = spyOn(res, 'removeHeader');
      resJSONSpy = spyOn(res, 'json');
      await userSignout(req, res);
      return done();
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('clears the cookie', () => {
      expect(resCookieSpy).toHaveBeenCalled();
    });
    it('clears the authorization header', () => {
      expect(resHeaderSpy).toHaveBeenCalledWith('Authorization');
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });
});
