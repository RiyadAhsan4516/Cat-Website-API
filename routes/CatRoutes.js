const express = require("express");
const Router = express.Router();
const CatController = require("./../controllers/CatController");
const AuthController = require("./../controllers/AuthController");

Router.route("/")
  .get(AuthController.isloggedin, CatController.GetAllCatBreeds)
  .post(CatController.CreateNewCatBreed);

Router.route("/stats").get(CatController.getCatStats);

Router.route("/toprated").get(
  CatController.alias,
  CatController.GetAllCatBreeds
);

Router.route("/:id")
  .get(CatController.GetSingleCatBreed)
  .patch(CatController.UpdateCatInfo)
  .delete(CatController.DeleteCatInfo);

module.exports = Router;
