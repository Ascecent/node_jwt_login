const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dbConnection = require("../db/db");
const { promisify } = require("util");

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Sign up method
exports.signup = async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body;

    if (!userName || !userEmail || !userPassword) {
      return res.render("signup", {
        alert: true,
        title: "Empty data",
        msg: "All the data must be provided, please try again.",
        icon: "error",
        confirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        route: "signup",
      });
    }

    if (!emailRegex.test(userEmail)) {
      return res.render("signup", {
        alert: true,
        title: "Invalid email",
        msg: "The provided email does not complain the requirements.",
        icon: "error",
        confirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        route: "signup",
      });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    dbConnection.query(
      `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`,
      [userName, userEmail, hashedPassword],
      (err, result) => {
        if (err) throw err;
        res.redirect("/login");
      }
    );
  } catch (err) {
    console.error(err);
  }
};

// Login method
exports.login = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
      return res.render("login", {
        alert: true,
        title: "Empty data",
        msg: "All the data must be provided, please try again.",
        icon: "error",
        confirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        route: "login",
      });
    }

    dbConnection.query(
      `SELECT email, password FROM user WHERE email = ?`,
      [userEmail],
      async (err, results) => {
        if (
          !results.length ||
          !(await bcrypt.compare(userPassword, results[0].password))
        ) {
          return res.render("login", {
            alert: true,
            title: "Invalid user or password",
            msg: "Incorrect user or password, please try again.",
            icon: "error",
            confirmButton: false,
            timer: 1500,
            timerProgressBar: false,
            route: "login",
          });
        }

        const id = results[0].id;

        // JWT creation
        const token = jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        });

        // Cookie configuration object
        const cookieOption = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRATION_TIME * 24 * 60 * 1000
          ),
          httpOnly: true,
        };

        // Cookie creation
        res.cookie("jwt", token, cookieOption);

        res.render("login", {
          alert: true,
          title: "Success authentication",
          msg: "The authentication has been succeeded, now will be redirect to the home page.",
          icon: "success",
          confirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          route: "",
        });
      }
    );
  } catch (err) {
    console.error(err);
  }
};

exports.isAuthenticated = async (req, res, next) => {
  if (!req.headers.cookie) return res.render("login", { alert: false });

  // Process for getting the parsed cookies
  const rawCookies = req.headers.cookie.split("; ");

  if (!rawCookies.length) return res.render("login");

  const parsedCookies = {};
  rawCookies.forEach((rawCookie) => {
    const parsedCookie = rawCookie.split("=");
    parsedCookies[parsedCookie[0]] = parsedCookie[1];
  });

  if (!parsedCookies.jwt) return res.redirect("/login");

  try {
    // Decoding the jwt string
    const decodedJwt = promisify(jwt.verify)(
      parsedCookies.jwt,
      process.env.JWT_SECRET_KEY
    );

    dbConnection.query(
      "SELECT name, email WHERE iduser = ?",
      [decodedJwt.id],
      (error, result) => {
        if (!result) return next();
        req.user = result[0];
        return next();
      }
    );
  } catch (error) {
    console.error(error);
    return next();
  }
};

exports.logOut = async (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/");
};
