const setResHeaders = (req, res, next) => {
  // list out allowed origins
  const whitelist = [
    process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
    process.env.ACCESS_CONTROL_ALLOW_ORIGIN_LOCALHOST,
  ];

  // check for request origin to set CORS
  const { origin } = req.headers;
  if (whitelist.indexOf(origin) > -1) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Content, Accept, Authorization, Set-Cookie',
  );
  res.header('Access-Control-Expose-Headers', 'Authorization');
  res.removeHeader('X-Powered-By');
  return next();
};

module.exports = setResHeaders;
