let mongoose = require('mongoose');
let config = require('config');
let dbURI = config.get('mongoURI');

let connectdb = async () => {
  try {
    let message = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log(`connected mongodb ...`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectdb;
