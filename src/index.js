const readmeRouter = require("./routers/readme");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const express = require("express");

require("dotenv").config();
require("./db/mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

//using routers
app.use(readmeRouter);
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
