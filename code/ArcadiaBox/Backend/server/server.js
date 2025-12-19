const express = require("express");
const app = express();
const apiRouter = require("./app/routes/apiRoutes.js");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");

app.use(cors({
	origin: '*',
	credentials: true,
}));
require("dotenv").config();


app.use(express.json());
app.use("/api", apiRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server démarré sur le port ${PORT}`);
	console.log(`Swagger docs disponibles sur http://localhost:${PORT}/api-docs`);
});
