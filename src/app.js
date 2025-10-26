const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./config/database');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Swagger Configurations (Keep as is)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusJam API',
      version: '1.0.0',
      description: 'API documentation for the CampusJam web application',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
    components: { /* ... securitySchemes ... */ },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, 'routes/**/*.js')],
};
const swaggerSpecs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes - Mount ALL routers directly
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const messageRoutes = require('./routes/message.routes');

app.use('/api/auth', authRoutes); // Auth routes are inherently public
app.use('/api', userRoutes);     // Apply middleware *inside* user.routes.js
app.use('/api', sessionRoutes); // Apply middleware *inside* session.routes.js
app.use('/api', messageRoutes); // Apply middleware *inside* message.routes.js

module.exports = app;

