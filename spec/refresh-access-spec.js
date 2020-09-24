const errResponse = require('../utils/error-response-handler');
const { refreshAccess } = require('../controllers/session-controller')(errResponse);
const { id1: ngoId } = require('../seeders/data/ngos-data');
const { id1: ngoAuthId } = require('../seeders/data/ngo-auths-data');

describe('POST /api/v1.0.0/auth/session', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    header: (params) => ({ ...params, ...res }),
    cookie: (data) => ({ data, ...res }),
    json: (data) => ({ ...data, ...res }),
    send: (message) => ({ message, ...res }),
  };

  describe('when requested', () => {
    const req = {
      query: { userId: ngoId },
      body: {
        authId: ngoAuthId,
        email: 'childdreamsfoundation@gmail.com',
        role: 'ngo',
      },
    };
    let resStatusSpy;
    let resJSONSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resJSONSpy = spyOn(res, 'json');
      await refreshAccess(req, res);
      return done();
    });

    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with a JSON data', () => {
      expect(resJSONSpy).toHaveBeenCalled();
    });
  });
});
