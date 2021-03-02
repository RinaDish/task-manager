const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

// function error(err, req, res, next) {
//   // log it
//   if (!test) console.error(err.stack);

//   // respond with 500 "Internal Server Error".
//   res.status(500);
//   res.send('Internal Server Error');
// }

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
// app.use(error);

module.exports = app;
