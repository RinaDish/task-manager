const express = require('express');
require('./db/mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const readmeRouter = require('./routers/readme');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API',
      description: 'API Information',
    },
    servers: ['http://localhost:3000'],
  },
  apis: ['swagger.yml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://dish-task-manager.herokuapp.com'],
    credentials: true,
  }),
);
app.get('/', async (req, res) => res.redirect('/api-docs'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(readmeRouter);
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
