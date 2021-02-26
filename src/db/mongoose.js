const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_CONNECT_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
