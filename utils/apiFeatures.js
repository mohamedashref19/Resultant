class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { limit, page, fields, sort, ...queryObj } = this.queryString;
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte?|gte?)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("createAt _id");
    }
    return this;
  }
  limitField() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(",").join(" ");
      this.query.select(field);
    } else {
      this.query.select("-__v");
    }
    return this;
  }
  pagination() {
    const page1 = this.queryString.page * 1 || 1;
    const limit1 = this.queryString.limit * 1 || 100;
    const skip = (page1 - 1) * limit1;
    this.query = this.query.skip(skip).limit(limit1);
    return this;
  }
}
module.exports = ApiFeatures;
