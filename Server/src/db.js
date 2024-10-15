const sqlite3 = require("sqlite3");
const config = require("./config");

const db = new sqlite3.Database(config.databasePath, (err) => {
	if (err) {
		console.error("Error opening database", err);
	} else {
		console.log("Database connected");
	}
});

module.exports = db;
