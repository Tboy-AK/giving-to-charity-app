const apiNavDoc = require('../documentation/endpoints.json');

const apiNavController = () => {
  const apiNavs = (req, res) => res.status(200).render('api-home', {
    title: 'Welcome to the Give To Charity API',
    endpoints: apiNavDoc,
  });

  return { apiNavs };
};

module.exports = apiNavController;
