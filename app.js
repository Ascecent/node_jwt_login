const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express();

// Setting ejs
app.set("view engine", "ejs");

// Set folder for static files
app.use(express.static("public"));

// Configure node for data processing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set env variables
dotenv.config({ path: "./env/.env" });

// Call router
app.use("/", require("./routes/router"));

// Set cookies
app.use(cookieParser());

app.listen(8080, () => {
  console.log("SERVER UP running in http://localhost:8080");
});
