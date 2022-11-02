const AppError = require("./../utils/AppError");

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

function handleDuplicateErrorDB(err) {
  const message = `Duplicate field values : ${Object.values(err.keyValue)}`;
  return new AppError(message, 400);
}

function devError(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
}

function prodError(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error occured", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") devError(err, res);
  else {
    let modifiedError = { ...err };
    if (err.name == "CastError") {
      modifiedError = handleCastErrorDB(modifiedError);
      prodError(modifiedError, res);
    } else if (err.code === 11000) {
      modifiedError = handleDuplicateErrorDB(modifiedError);
      prodError(modifiedError, res);
    } else if (err.name === "ValidationError") {
      modifiedError = new AppError(err.message, 400);
      prodError(modifiedError, res);
    } else {
      prodError(err, res);
    }
  }
};
