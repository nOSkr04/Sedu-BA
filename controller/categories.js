import Category from "../models/Category.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";

export const getCategories = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;
  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Category);

  const categories = await Category.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: categories,
    pagination,
  });
});

export const getCategory = asyncHandler(async (req, res, next) => {
  const t = await req.db.teacher.findByPk(1);
  const c = await t.getCourses();

  const category = await Category.findById(req.params.id).populate("articles");

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүйээээ.", 400);
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});
