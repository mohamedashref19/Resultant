const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    ref: "User",
    type: mongoose.Schema.ObjectId,
    required: [true, "Order must belong to user"],
  },
  items: [
    {
      meal: {
        ref: "Meals",
        type: mongoose.Schema.ObjectId,
        required: [true, "Order must belong to meal"],
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        required: [true, "Item must have a price"],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: [true, "Order must there price"],
  },
  status: {
    type: String,
    enum: ["pending", "cooking", "delivering", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre(/^find/, async function () {
  this.populate({
    path: "user",
    select: "name email",
  }).populate({
    path: "items.meal",
    select: "name imageCover",
  });
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
