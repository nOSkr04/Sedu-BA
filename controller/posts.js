import asyncHandler from "express-async-handler";
import path from "path";
import sharp from "sharp";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import User from "../models/User.js";
import MyError from "../utils/myError.js";
import paginate from "../utils/paginate.js";

// api/v1/Posts

export const getPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Post.find(req.query));

  const posts = await Post.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
    pagination,
  });
});

export const getPostsNoShare = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Post.find(req.query));
  req.query.isShare = false;

  const posts = await Post.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
    pagination,
  });
});

export const getUserPosts = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.params.id;

  return this.getPosts(req, res, next);
});

export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй post байхгүй байна.", 404);
  }

  const like = await Like.find({
    createUser: req.userId,
    post: req.params.id,
  }).select("post");
  post.count += 1;
  post.save();
  if (like != null) {
    post.isLiked = true;
  } else {
    post.isLiked = false;
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

export const createProfile = asyncHandler(async (req, res, next) => {
  const postCat = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: postCat,
  });
});

export const createPost = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    throw new MyError("Body хоосон байж болохгүй", 400);
  }
  req.body.createUser = req.userId;
  const articl = await Post.create(req.body);
  const user = await User.findById(req.userId);
  articl.name = user.name;

  articl.save();

  user.postNumber += 1;
  user.save();
  req.body.createUser = req.userId;
  req.body.type = "Post";
  req.body.crud = "Create";
  req.body.postId = articl._id;

  res.status(200).json({
    success: true,
    article: articl,
  });
});

export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй post байхгүй байна.", 404);
  }

  // if (
  //   post.createProfile.toString() !== req.userId &&
  //   req.userRole !== "admin"
  // ) {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  post.remove();

  res.status(200).json({
    success: true,
    data: post,
  });
});

export const updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new MyError(req.params.id + " ID-тэй post байхгүйээээ.", 400);
  }

  if (post.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө post-ийг л засварлах эрхтэй", 403);
  }

  req.body.updateProfile = req.userId;

  for (let attr in req.body) {
    post[attr] = req.body[attr];
  }

  post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});

export const uploadPostPhoto = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new MyError(req.userId + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }

  if (file.size > process.env.MAX_UPLOAD_FILE_SIZE) {
    throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);
  }

  file.name = `post_${req.params.id}${path.parse(file.name).ext}`;

  const picture = await sharp(file.data)
    .resize({ width: parseInt(process.env.FILE_SIZE) })
    .toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);

  post.photo = file.name;
  post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});
