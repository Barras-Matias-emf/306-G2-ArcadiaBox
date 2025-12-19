const mysql = require("mysql2/promise");
require("dotenv").config();

const connection = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER, // Assurez-vous que cette variable est définie
	password: process.env.DB_PASSWORD, // Assurez-vous que cette variable est définie
	database: process.env.DB_NAME, // Assurez-vous que cette variable est définie
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

module.exports = connection;
