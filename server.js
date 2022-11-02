const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Shutting down ...");
  process.exit(1);
});

const mongoose = require("mongoose");
const app = require("./app");

const db = process.env.DATABASE;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    if (process.env.NODE_ENV == "development")
      console.log("connection to database created");
  });

const server = app.listen(process.env.PORT, process.env.LOCALHOST, () => {
  if (process.env.NODE_ENV == "development") console.log("server running...");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Shutting down ...");
  server.close(() => {
    process.exit(1);
  });
});
