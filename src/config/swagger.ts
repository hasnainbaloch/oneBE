import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { API_VERSION } from './api.constants';
dotenv.config();

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'oneBE App API',
      version: '1.0.0',
      description: 'API documentation for the oneBE App',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        cookieAuth: []
      }
    ]
  },
  apis: ['src/doc/swagger/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;