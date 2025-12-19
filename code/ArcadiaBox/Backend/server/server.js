const express = require("express");
const app = express();
const apiRouter = require("./app/routes/apiRoutes.js");
const cors = require("cors");

app.use(cors({
	origin: '*',
	credentials: true,
}));
require("dotenv").config();


app.use(express.json());
app.use("/api", apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server démarré sur le port ${PORT}`);
});
