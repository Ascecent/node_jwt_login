const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rendering pages

// Home page
router.get("/", authController.isAuthenticated, (req, res) => {
  res.render("index");
});

// Login page
router.get("/login", (req, res) => {
  res.render("login", { alert: false });
});

// Signup page
router.get("/signup", (req, res) => {
  res.render("signup", { alert: false });
});

// Controller methods

// Signup
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

// Logout
router.get("/logout", authController.logOut);

module.exports = router;
