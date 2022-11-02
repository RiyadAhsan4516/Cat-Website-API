const express = require("express");
const Router = express.Router();
const AuthController = require("./../controllers/AuthController");

Router.post("/signup", AuthController.signup);
Router.post("/login", AuthController.login);
Router.post("/forgotPassword", AuthController.forgotpassword);

module.exports = Router;