const express = require('express');
require('./db/mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API',
      description: 'API Information',
    },
    servers: ['http://localhost:3000'],
  },
  apis: ['src/routers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
