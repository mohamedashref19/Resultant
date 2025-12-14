const multer = require("multer");
const sharp = require("sharp");
const Meal = require("./../model/mealsModel");
const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("./../utils/apiFeatures");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("please upload only image.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadImage = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 3,
  },
]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.files.images && !req.files.imageCover) return next();

  req.body = { ...req.body };
  const mealId = req.params.id || "new";
  if (req.files.imageCover) {
    const imageCoverFilename = `meal-${mealId}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/meals/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;
  }
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const mealId = req.params.id || "new";
        const filename = `meal-${mealId}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/meals/${filename}`);

        req.body.images.push(filename);
      })
    );
  }
  next();
});

exports.getAll = catchAsync(async (req, res, next) => {
  let filter = {} || req.filter;
  if (req.params.id) filter = { meal: req.params.id };

  const features = new ApiFeatures(Meal.find(filter), req.query)
    .filter()
    .sort()
    .limitField()
    .pagination();

  const meals = await features.query;
  res.status(200).json({
    status: "success",
    result: meals.length,
    data: {
      meals,
    },
  });
});
exports.getone = catchAsync(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    return next(new AppError("there is no meal with ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      meal,
    },
  });
});

exports.updatemeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!meal) {
    return next(new AppError("there is no meal with ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      meal,
    },
  });
});
exports.deletemeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findByIdAndDelete(req.params.id);

  if (!meal) {
    return next(new AppError("there is no meal with ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.createmeal = catchAsync(async (req, res, next) => {
  const newmeal = await Meal.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      meal: newmeal,
    },
  });
});
