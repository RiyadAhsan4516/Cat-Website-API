const mongoose = require("mongoose");
const Validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A person needs to have a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: [true, "A user with this email already exists"],
    validate: [Validator.isEmail, "The email is invalid"],
  },
  photo: String,
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "guide", "lead-guide"],
      message: "The role you entered does not exist",
    },
    default: "user",
  },
  password: {
    type: String,
    minlength: [8, "Minimum length of the password should be 8"],
    required: [true, "You must provide a password"],
    select: false,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        return val == this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResteTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

// Encrypt password:
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

const UserModel = mongoose.model("Users", UserSchema);
module.exports = UserModel;
