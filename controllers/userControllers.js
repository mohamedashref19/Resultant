const multer = require("multer");
const sharp = require("sharp");
const User = require("../model/usermodel");
const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");

const multerstorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("please upload only image.", 400), false);
  }
};
const upload = multer({
  storage: multerstorage,
  fileFilter: multerFilter,
});

exports.uploadimage = upload.single("photo");

exports.rezieuserimage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterobj = (obj, ...allowed) => {
  let newobj = {};
  Object.keys(obj).forEach((el) => {
    if (allowed.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};

exports.getAlluser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      user: users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filterBody = filterobj(req.body, "name", "email");
  if (req.file) filterBody.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
