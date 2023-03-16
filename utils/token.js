const jwt = require('jsonwebtoken');

generator = function (payload) {
  const accessSecretKey = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.ACCESS_PRIVATE}\n-----END RSA PRIVATE KEY-----`;
  const refreshSecretKey = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.REFRESH_PRIVATE}\n-----END RSA PRIVATE KEY-----`;
  
  const accessToken = jwt.sign(payload, accessSecretKey, {
      expiresIn: process.env.ACCESS_PUBLIC,
      algorithm:  "RS256"
    });

  const refreshToken = jwt.sign(payload, refreshSecretKey, {
    expiresIn: process.env.REFRESH_PUBLIC,
    algorithm:  "RS256"
  });

  return { accessToken, refreshToken }
}

verify = function (token, publicKey) {
  var rsaPublickKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

  const decodedToken = jwt.verify(token, rsaPublickKey, {
      algorithms: ["RS256"]
  });
  
  return decodedToken
}

module.exports = { generator, verify };