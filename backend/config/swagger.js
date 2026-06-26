import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Receta API',
      version: '1.0.0',
      description: 'API documentation for Receta backend',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:4000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js','./controllers/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
