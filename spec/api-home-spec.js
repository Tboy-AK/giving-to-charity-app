const { apiNavs } = require('../controllers/api-home-controller')();

describe('GET /api/v1.0.0', () => {
  const res = {
    status: (statusCode) => ({ statusCode, ...res }),
    render: (message) => ({ message, ...res }),
  };

  describe('when requested', () => {
    const req = {};
    let resStatusSpy;
    let resRenderSpy;

    beforeAll(async (done) => {
      resStatusSpy = spyOn(res, 'status').and.callThrough();
      resRenderSpy = spyOn(res, 'render');
      await apiNavs(req, res);
      done();
    });
    it('responds status 200', () => {
      expect(resStatusSpy).toHaveBeenCalledWith(200);
    });
    it('responds with an html text string', () => {
      expect(resRenderSpy).toHaveBeenCalled();
    });
  });
});
