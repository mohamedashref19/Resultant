const mongoose = require("mongoose");
const Meal = require("./mealsModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    meal: {
      type: mongoose.Schema.ObjectId,
      ref: "Meals",
      required: [true, "Review must belong to a meal."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ meal: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, async function () {
  this.populate({
    path: "user",
    select: "name photo",
  });
  // next();
});
reviewSchema.statics.calcAverageRatings = async function (mealId) {
  const stats = await this.aggregate([
    {
      $match: { meal: mealId },
    },
    {
      $group: {
        _id: "$meal",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Meal.findByIdAndUpdate(mealId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Meal.findByIdAndUpdate(mealId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.meal);
});
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.meal);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
