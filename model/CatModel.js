const mongoose = require("mongoose");
const validator = require("validator");

const CatSchema = new mongoose.Schema({
  breed: {
    type: String,
    required: [true, "A cat must have a breed"],
    unique: [true, "Similar breed already exists"],
    trim: true,
    maxlength: [100, "The breed name must be less or equal to 100 characters"],
    minlength: [3, "The breed name must not have less than 3 characters in it"],
    // validate: [validator.isAlpha, "Breed names must only contain characters"],
  },
  size: {
    type: String,
    required: [true, "There must be a size"],
  },
  coat: {
    type: String,
    default: "medium",
  },
  color: {
    type: String,
    required: [true, "A cat must have a color"],
  },
  description: {
    type: String,
    default: "No description given",
  },
  life_expectancy: {
    type: Number,
    default: 10,
  },
  ratings: {
    type: Number,
    default: 4.0,
    min: [1, "The minimum rating of 1.0 is allowed"],
    max: [5, "the maximum rating of 5.0 is allowed"],
  },
  price: {
    type: Number,
    required: [true, "There must be a price"],
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "Every breed must have a price above 0",
    },
  },
});

const CatModel = mongoose.model("CatModel", CatSchema, "catData");

module.exports = CatModel;
