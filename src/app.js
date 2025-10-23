const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./config/database');
const authMiddleware = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Init DB connection
connectDB();

const app = express();

// Middleware
app.use(cors());
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
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token as: Bearer <your_token_here>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
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

// Public routes (no JWT required)
app.use('/api/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);

// Health check endpoint
app.get('/', (req, res) => res.send('CampusJam API is running 🚀'));

module.exports = app;
