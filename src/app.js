const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./config/database');
const cors = require('cors');

require('./models/message.model.js');
require('./models/report.model.js');
require('./models/session.model.js');
require('./models/user.model.js');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3001',
};
app.use(cors(corsOptions));

// Swagger Configurations
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

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const messageRoutes = require('./routes/message.routes');

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', sessionRoutes);
app.use('/api', messageRoutes);

module.exports = app;

