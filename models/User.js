let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: email,
    required: true,
    unique: true
  },
  password: {
    type: password,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

let UserModel = mongoose.Model('user', UserSchema);

module.exports = UserModel;
