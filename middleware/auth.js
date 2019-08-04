let jwt = require('jsonwebtoken');
let config = require('config');
let auth = (req, res, next) => {
  let token = req.header('x-auth-token');
  if (!token) {
    return res.status(400).json({ errors: [{ msg: 'Jwt token required !' }] });
  }
  try {
    let decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(400).json({ errors: [{ msg: 'Jwt token invalid !' }] });
  }
};

module.exports = auth;
