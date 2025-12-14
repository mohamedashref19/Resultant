const Order = require("./../model/orderModel");
const Meal = require("./../model/mealsModel");
const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { format } = require("morgan");
const User = require("../model/usermodel");

exports.createOrder = catchAsync(async (req, res, next) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError("No items in this order", 400));
  }

  let totalPrice = 0;

  const orderPromiss = items.map(async (item) => {
    const meal = await Meal.findById(item.meal);
    if (!meal) {
      throw new AppError(`Meal not found with ID: ${item.meal}`, 404);
    }
    const price = meal.discountPrice || meal.price;
    totalPrice += price * item.quantity;
    return {
      meal: meal._id,
      quantity: item.quantity,
      price: price,
    };
  });
  const resolveOrder = await Promise.all(orderPromiss);
  const newOrder = await Order.create({
    user: req.user.id,
    items: resolveOrder,
    totalPrice: totalPrice,
  });

  res.status(201).json({
    status: "success",
    data: {
      order: newOrder,
    },
  });
});

exports.getAllOrder = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.user.role === "user") {
    filter = { user: req.user.id };
  }

  const orders = await Order.find(filter);

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  order.status = req.body.status;
  await order.save();
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  if (req.user.role === "user" && order.user.id !== req.user.id) {
    return next(
      new AppError("You do not have permission to view this order", 403)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.cancelMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("You are not allowed to cancel this order", 403));
  }
  if (order.status !== "pending") {
    return next(
      new AppError(
        "You cannot cancel this order, it is already under cooking/delivery",
        400
      )
    );
  }
  order.status = "cancelled";
  await order.save();
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});
//Aggregation Pipeline
exports.getOrderStats = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $match: { status: { $ne: "cancelled" } },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        numOrders: { $sum: 1 },
        totalPrice: { $sum: "$totalPrice" },
        avgPrice: { $avg: "$totalPrice" },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getBestSellers = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $match: { status: { $ne: "cancelled" } },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.meal",
        numSold: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
    },
    {
      $sort: {
        numSold: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "meals",
        localField: "_id",
        foreignField: "_id",
        as: "mealData",
      },
    },
    {
      $project: {
        _id: 1,
        numSold: 1,
        totalRevenue: 1,
        name: { $arrayElemAt: ["$mealData.name", 0] },
        image: { $arrayElemAt: ["$mealData.imageCover", 0] },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getGeneralStats = catchAsync(async (req, res, next) => {
  const [usersCount, mealsCount, ordersCound] = await Promise.all([
    User.countDocuments(),
    Meal.countDocuments(),
    Order.countDocuments(),
  ]);
  res.status(200).json({
    status: "success",
    data: {
      users: usersCount,
      meals: mealsCount,
      orders: ordersCound,
    },
  });
});
