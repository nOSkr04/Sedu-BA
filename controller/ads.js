const Ad = require("../models/Ad.js");
const path = require("path");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
// api/v1/ads
exports.getAds = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Ad.find(req.query));

  const ads = await Ad.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads,
    pagination,
  });
});

exports.getAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id).populate({
    path: "createUser",
    select: "firstName profile",
  });

  if (!ad) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }
  ad.count += 1;
  ad.save();

  res.status(200).json({
    success: true,
    data: ad,
  });
});

exports.createAd = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  const ad = await Ad.create(req.body);

  res.status(200).json({
    success: true,
    data: ad,
  });
});

exports.deleteAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (ad.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах хэрэгтэй", 403);
  }

  const user = await User.findById(req.userId);

  ad.remove();

  res.status(200).json({
    success: true,
    data: ad,
  });
});

exports.updateAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй", 400);
  }

  if (ad.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах хэрэгтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    ad[attr] = req.body[attr];
  }

  ad.save();

  res.status(200).json({
    success: true,
    data: ad,
  });
});

// PUT: api/v1/ads/:id/photo
exports.uploadAdPhoto = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй", 400);
  }

  const file = req.files.file;

  // image upload
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Зураг оруул", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Зурагны хэмжээ хэтэрсэн байна", 400);
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }

    ad.image = file.name;
    ad.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

exports.uploadAdProfile = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй", 400);
  }

  const file = req.files.file;

  // image upload
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Зураг оруул", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Зурагны хэмжээ хэтэрсэн байна", 400);
  }

  file.name = `profile_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
    }

    ad.profile = file.name;
    ad.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
