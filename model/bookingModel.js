const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  meal: {
    type: mongoose.Schema.ObjectId,
    ref: "Meals",
    required: [true, "Booking must belong to a Meal!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User!"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price."],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, async function () {
  this.populate("user").populate({
    path: "meal",
    select: "name",
  });
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
