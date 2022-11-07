const mongoose = require("mongoose");
const Validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
      values: ["user", "admin", "seller"],
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
  passwordResetTokenExpires: Date,
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

// Updated the passwordChangedAt for updating the password:
UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Check if password was changed:
UserSchema.methods.wasPasswordchanged = function (jwttimestamp) {
  if (!this.passwordChangedAt) return false;
  const changeDate = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  if (changeDate > jwttimestamp) return true;
  else return false;
};

//Password reset token:
UserSchema.methods.CreatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const UserModel = mongoose.model("Users", UserSchema);
module.exports = UserModel;
