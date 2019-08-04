let express = require('express');
let Router = express.Router();

// route api/users

// access public
Router.get('/', (req, res) => {
  res.send('users');
});

module.exports = Router;
