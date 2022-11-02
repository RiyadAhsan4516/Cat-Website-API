const User = require("./../model/UserModel");
const CatchAsync = require("./../utils/CatchAsync");
const AppError = require("./../utils/AppError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function generateToken(id) {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.EXPIRE,
  });
}

// Signup
exports.signup = CatchAsync(async (req, res, next) => {
  if (
    req.body.role &&
    (req.body.role == "admin" || req.body.role == "lead-guide")
  )
    return next(
      new AppError("You cannot set yourself as admin or lead-guide", 400)
    );
  const newUser = await User.create(req.body);
  newUser.password = undefined;
  const token = generateToken(newUser.id);
  res.status(200).json({
    status: "Success",
    token,
    data: {
      newUser,
    },
  });
});

// Login
exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide all the credentials", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError("Invalid email or password", 401));
  const token = generateToken(user.id);
  res.status(200).json({
    status: "Success",
    message: "You are logged in",
    token,
  });
});

// Check if user is logged in
exports.isloggedin = CatchAsync(async (req, res, next) => {});
