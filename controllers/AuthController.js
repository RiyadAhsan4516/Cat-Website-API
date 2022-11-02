const { promisify } = require("util");
const User = require("./../model/UserModel");
const CatchAsync = require("./../utils/CatchAsync");
const AppError = require("./../utils/AppError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("./../utils/Email");

function generateToken(id) {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.EXPIRE,
  });
}

// Signup
exports.signup = CatchAsync(async (req, res, next) => {
  if (req.body.role && req.body.role == "admin")
    return next(new AppError("You cannot set yourself as admin", 400));
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
exports.isloggedin = CatchAsync(async (req, res, next) => {
  let token;
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  )
    return next(new AppError(" You are not logged in", 401));
  else {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("You are not logged in", 401));
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("User does not exist anymore", 404));
  if (user.wasPasswordchanged(decoded.iat))
    return next(
      new AppError(
        "Your password was changed please login with new password",
        401
      )
    );
  req.user = user;
  next();
});

// Forgot Password?
exports.forgotpassword = CatchAsync(async (req, res, next) => {
  const user = await User.findOne(req.body);
  const resetToken = user.CreatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `Forgot your password? click on this url ${resetURL} to reset your password. Ignore this email if this is a mistake`;
  try {
    const options = {
      email: user.email,
      subject: "Reset your password",
      message,
    };
    await sendEmail(options);
    res.status(200).json({
      status: "Success",
      message: "An email is sent to your provided email address",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppError("Failed to send the email", 500));
  }
});