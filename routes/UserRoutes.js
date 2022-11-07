const express = require("express");
const Router = express.Router();
const AuthController = require("./../controllers/AuthController");
const UserController = require("./../controllers/UserController");

Router.post("/signup", AuthController.signup);
Router.post("/login", AuthController.login);
Router.post("/forgotPassword", AuthController.forgotpassword);
Router.post("/resetPassword/:token", AuthController.resetPassword);
Router.patch(
  "/updatePassword",
  AuthController.isloggedin,
  AuthController.updatePassword
);

Router.patch("/updateMe", AuthController.isloggedin, UserController.updateMe);
Router.get("/deleteMe", AuthController.isloggedin, UserController.deleteMe);
Router.get("/", AuthController.isloggedin, UserController.getAllUsers);

module.exports = Router;
