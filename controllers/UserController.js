const User = require("./../model/UserModel");
const CatchAsync = require("./../utils/CatchAsync");
const AppError = require("./../utils/AppError");

function checkRole(role) {
  if (role != "admin") return false;
  else return true;
}

exports.getAllUsers = CatchAsync(async (req, res, next) => {
  let users;
  if (checkRole(req.user.role)) users = await User.find();
  else users = await User.find({ active: true });

  res.status(200).json({
    status: "Success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = CatchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  res.status(200).json({
    status: "Success",
    user,
  });
});

exports.updateMe = CatchAsync(async (req, res, next) => {
  let user;
  if (req.body.role && req.body.role == "admin")
    return next(new AppError("You cannot make yourself admin", 400));
  else if (req.body.password)
    return next(
      new AppError(
        "This is not the route for updating password. Please use /updatePassword",
        400
      )
    );
  else {
    let newObj = {};
    const allowed = ["name", "email"];
    allowed.forEach((el) => {
      if (req.body[el]) newObj[el] = req.body.el;
    });
    user = await User.findByIdAndUpdate(req.user.id, newObj, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    status: "Success",
    message: "Your profile has been updated",
    data: {
      user,
    },
  });
});

exports.deleteMe = CatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "Success",
    message: "Id deactivated",
  });
});
