let express = require('express');
let app = express();
let port = process.env.PORT || 5000;

app.listen(port, err => {
  if (err) {
    console.error('Error : ', err);
  } else {
    console.log(`Server started on ${port}`);
  }
});
