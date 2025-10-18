const express = require('express');
const path = require('path');
const { connectDB } = require('./config/database');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const messageRoutes = require('./routes/message.routes');

// Init DB connection
connectDB();

const app = express();

// Init Middleware
app.use(express.json());

// Swagger Configurations
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusJam API',
      version: '1.0.0',
      description: 'API documentation for the CampusJam web application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  // Correctly resolve the absolute path to the routes directory
  apis: [path.join(__dirname, 'routes/**/*.js')]
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Define Routes
app.use('/api', userRoutes);
app.use('/api', sessionRoutes);
app.use('/api', messageRoutes);

module.exports = app; // Export the app