const express = require("express");
const morgan = require("morgan");
const CatRouter = require("./routes/CatRoutes");
const UserRouter = require("./routes/UserRoutes");
const AppError = require("./utils/AppError");
const ErrorController = require("./controllers/ErrorController");

const app = express();

app.use(express.json());

if (process.env.NODE_ENV == "development") {
  console.log("Environment switched to development");
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestedAt = `${new Date().toDateString()} ${new Date().toLocaleTimeString()}`;
  next();
});

app.use("/api/v1/cats", CatRouter);
app.use("/api/v1/users", UserRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} does not exist in this server`, 404));
});

app.use(ErrorController);

module.exports = app;
