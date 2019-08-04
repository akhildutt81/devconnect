let express = require('express');
let Router = express.Router();
let auth = require('../../middleware/auth');
let { check, validationResult } = require('express-validator/check');
let Users = require('../../models/User');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let config = require('config');

// login
Router.post(
  '/',
  [
    check('email', 'enter valid email').isEmail(),
    check('password', 'password should be 6 or more characters')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { email, password } = req.body;
    try {
      let user = await Users.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      let match = await bcrypt.compare(password, user.password);
      if (match) {
        let payload = {
          user: {
            id: user.id
          }
        };
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: 36000 },
          (err, token) => {
            if (err) throw err;
            return res.json({ token });
          }
        );
      } else {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errors: [err] });
    }
  }
);

// get user details
Router.get('/', auth, async (req, res) => {
  try {
    let user = await Users.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (err) {
    return res.status(500).send('server error');
  }
});

module.exports = Router;
