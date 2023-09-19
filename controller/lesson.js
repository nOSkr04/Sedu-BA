import Lesson from "../models/Lesson.js";
import path from "path";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";

// api/v1/lessons
export const getLessons = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Lesson);

  const lessons = await Lesson.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons,
    pagination,
  });
});

export const getUserLessons = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getLessons(req, res, next);
});

export const getLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  lesson.seen += 1;
  lesson.save();

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

export const createLesson = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const lesson = await Lesson.create(req.body);

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

export const deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (lesson.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  lesson.remove();

  res.status(200).json({
    success: true,
    data: lesson,
    whoDeleted: user.name,
  });
});

export const updateLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (lesson.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    lesson[attr] = req.body[attr];
  }

  lesson.save();

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

// PUT:  api/v1/lessons/:id/photo
export const uploadLessonPhoto = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
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

    lesson.photo = file.name;
    lesson.save();

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
