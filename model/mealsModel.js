const mongoose = require("mongoose");
const slugify = require("slugify");

const mealsSchmema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "meals must there name!"],
      unique: true,
      trim: true,
      minlength: [3, "name tour must more 10 character"],
      maxlength: [40, "name tour must less 40 character"],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "rating must more 1.0"],
      max: [5, "rating must less 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      required: [true, "meals must there price"],
    },
    description: {
      type: String,
      required: [true, "meals must there description!"],
    },
    category: {
      type: String,
      required: [true, "meals must there category!"],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "disount price must less main price",
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

mealsSchmema.pre("save", function () {
  this.slug = slugify(this.name, { lower: true });
});
mealsSchmema.virtual("reviews", {
  ref: "Review",
  foreignField: "meal",
  localField: "_id",
});

const Meals = mongoose.model("Meals", mealsSchmema);

module.exports = Meals;
