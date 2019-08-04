let express = require('express');
let app = express();
let port = process.env.PORT || 5000;
let connectDB = require('./config/db');

connectDB();

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));

app.get('/', (req, res) => {
  res.send('Hello !');
});

app.listen(port, err => {
  if (err) {
    console.error('Error : ', err);
  } else {
    console.log(`Server started on ${port}`);
  }
});
