import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Addons Marketplace API",
      version: "1.0.0",
      description: "API Documentation for Marketplace Addon Game Simulator",
    },
    servers: [{ url: "http://localhost:5000" }],
  },
  apis: ["./routes/*.js"], // Swagger akan baca dari folder routes
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
