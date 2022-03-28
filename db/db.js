const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

dbConnection.connect((error) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log("Connection established");
});

module.exports = dbConnection;
