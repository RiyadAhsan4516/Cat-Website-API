const Cats = require("./../model/CatModel");
const ApiFeatures = require("./../utils/ApiFeatures");
const AppError = require("./../utils/AppError");
const CatchAsync = require("./../utils/CatchAsync");

exports.alias = (req, res, next) => {
  req.query.sort = "-ratings";
  req.query.fields = "breed,ratings,life_expectancy";
  req.query.page = "1";
  req.query.limit = "3";
  next();
};

exports.GetAllCatBreeds = CatchAsync(async (req, res, next) => {
  const Features = new ApiFeatures(Cats.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const cats = await Features.query;

  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    results: cats.length,
    data: {
      cats: cats,
    },
  });
});

exports.CreateNewCatBreed = CatchAsync(async (req, res, next) => {
  const catInfo = await Cats.create(req.body);
  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    message: "Cat Data updated",
    data: {
      cat: catInfo,
    },
  });
});

exports.GetSingleCatBreed = CatchAsync(async (req, res, next) => {
  const catInfo = await Cats.findById(req.params.id);

  if (!catInfo) {
    return next(new AppError("No cat found with this id", 404));
  }

  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    data: {
      cat: catInfo,
    },
  });
});

exports.UpdateCatInfo = CatchAsync(async (req, res, next) => {
  await Cats.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!catInfo) {
    return next(new AppError("No cat found with this id", 404));
  }

  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    message: `Cat id ${req.params.id} updated with provided information`,
  });
});

exports.DeleteCatInfo = CatchAsync(async (req, res, next) => {
  await Cats.findByIdAndDelete(req.params.id);

  if (!catInfo) {
    return next(new AppError("No cat found with this id", 404));
  }

  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    message: `Information of id ${req.params.id} has been deleted`,
  });
});

exports.getCatStats = CatchAsync(async (req, res, next) => {
  const stat = await Cats.aggregate([
    // aggregate is a pipeline. And most piplines usually take in an array of steps.
    {
      $match: { ratings: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$ratings",
        numOfCats: { $sum: 1 },
        avgRating: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        avgLifeSpan: { $avg: "$life_expectancy" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        minLifeSpan: { $min: "$life_expectancy" },
        maxLifeSpan: { $max: "$life_expectancy" },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    {
      $match: { _id: { $lt: 4.7 } },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(200).json({
    status: "Success",
    requestedAt: req.requestedAt,
    data: {
      catStats: stat,
    },
  });
});
