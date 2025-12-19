const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ArcadiaBox API",
      version: "1.0.0",
      description: "Documentation de l'API pour le serveur ArcadiaBox",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Serveur local",
      },
    ],
  },
  apis: ["./app/routes/*.js"], // Chemin vers les fichiers contenant les annotations Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
