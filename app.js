const express = require("express");
const morgan = require("morgan");
const CatRouter = require("./routes/CatRoutes");
const UserRouter = require("./routes/UserRoutes");
const AppError = require("./utils/AppError");
const ErrorController = require("./controllers/ErrorController");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const helmet = require("helmet");

const app = express();

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Request limit reached. Try again after 1 hour",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

if (process.env.NODE_ENV == "development") {
  console.log("Environment switched to development");
  app.use(morgan("dev"));
}

app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

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
