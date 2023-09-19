import Story from "../models/Story.js";
import path from "path";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";

// api/v1/storys
export const getStorys = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Story);

  const storys = await Story.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: storys.length,
    data: storys,
    pagination,
  });
});

export const getUserStorys = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getStorys(req, res, next);
});

export const getStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  story.seen += 1;
  story.save();

  res.status(200).json({
    success: true,
    data: story,
  });
});

export const createStory = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const story = await Story.create(req.body);

  res.status(200).json({
    success: true,
    data: story,
  });
});

export const deleteStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (story.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  story.remove();

  res.status(200).json({
    success: true,
    data: story,
    whoDeleted: user.name,
  });
});

export const updateStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (story.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    story[attr] = req.body[attr];
  }

  story.save();

  res.status(200).json({
    success: true,
    data: story,
  });
});

// PUT:  api/v1/storys/:id/photo
export const uploadStoryPhoto = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, (err) => {
    if (err) {
      throw new MyError(
        "Файлыг хуулах явцад алдаа гарлаа. Алдаа : " + err.message,
        400
      );
    }

    story.photo = file.name;
    story.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
