const Cats = require("./../model/CatModel");

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const QueryObj = { ...this.queryStr };
    const excludedItems = ["sort", "fields", "page", "limit"];
    excludedItems.forEach((el) => delete QueryObj[el]);
    // {ratings: {$gte: 4.5}, life_expectancy: {$lte: 15}}
    let qstring = JSON.stringify(QueryObj);
    qstring = JSON.parse(
      qstring.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    );
    this.query = this.query.find(qstring);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortby = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort("-ratings -price -life_expectancy");
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const Fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(Fields);
    } else {
      if (process.env.NODE_ENV == "production") {
        this.query = this.query.select("-__v -_id");
      }
    }
    return this;
  }

  paginate() {
    if (this.queryStr.page && this.queryStr.limit) {
      const page = +this.queryStr.page;
      const limit = +this.queryStr.limit;
      const skipval = (page - 1) * limit;
      const count = this.count();
      if (skipval >= count) throw new Error("this page does not exist");
      else this.query = this.query.skip(skipval).limit(limit);
    }
    return this;
  }

  async count() {
    const countDoc = await Cats.countDocuments();
    return countDoc;
  }
}

module.exports = ApiFeatures;
