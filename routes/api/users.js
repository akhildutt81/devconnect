let express = require('express');
let Router = express.Router();
let { check, validationResult } = require('express-validator/check');
let Users = require('../../models/User');
let gravatar = require('gravatar');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let config = require('config');
// route api/users

// access public
Router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'enter valid email').isEmail(),
    check('password', 'password should be 6 or more characters').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { name, email, password } = req.body;
    try {
      let user = await Users.findOne({ email });
      if (user) {
        return res
          .json({ errors: [{ msg: 'User already exists' }] })
          .status(400);
      }
      let avatar = gravatar.url(email, { s: '200', d: 'mm' });
      user = new Users({ name, email, password, avatar });
      let salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.save();
      let payload = {
        user: {
          id: user.id
        }
      };
      let tok = jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errors: [err] });
    }
  }
);

module.exports = Router;
