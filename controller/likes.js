import asyncHandler from "express-async-handler";
import Like from "../models/Like.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import MyError from "../utils/myError.js";
import paginate from "../utils/paginate.js";

export const getLikes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Like.find(req.query));

  const likes = await Like.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({ success: true, data: likes, pagination });
});

export const getPostLikes = asyncHandler(async (req, res, next) => {
  req.query.post = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Like.find(req.query));

  const likes = await Like.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate("post");

  res.status(200).json({ success: true, data: likes, pagination });
});

export const getUsersPostLikes = asyncHandler(async (req, res, next) => {
  // req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(
    page,
    limit,
    Like.find({ createUser: req.params.id, post: { $ne: null } })
  );

  // const likes = await Like.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate("post share").populate({path: "post", populate: {path: "createUser", select: "lastName firstName profile"}}).populate({path: "share", populate: {path: "createUser", select: "lastName firstName profile"}})
  const likes = await Like.find({
    createUser: req.params.id,
    post: { $ne: null },
  }).select("post");

  res.status(200).json({ success: true, data: likes, pagination });
});

export const getUserLikes = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Like.find(req.query));

  const likes = await Like.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({ success: true, data: likes, pagination });
});

export const getUserPostLikes = asyncHandler(async (req, res, next) => {
  // req.query.createUser = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(
    page,
    limit,
    Like.find({ createUser: req.params.id, post: { $ne: null } })
  );

  // const likes = await Like.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit).populate("post share").populate({path: "post", populate: {path: "createUser", select: "lastName firstName profile"}}).populate({path: "share", populate: {path: "createUser", select: "lastName firstName profile"}})
  const likes = await Like.find({
    createUser: req.params.id,
    post: { $ne: null },
  }).select("post");

  res.status(200).json({ success: true, data: likes, pagination });
});

export const getLike = asyncHandler(async (req, res, next) => {
  const like = await Like.findById(req.params.id).populate("books");

  if (!like) {
    throw new MyError(req.params.id + " ID-тай like байхгүй.", 400);
  }

  // like.name += "-"
  // like.save(function (err) {
  // if (err) console.log("error: ", err)
  // console.log("saved...")
  // })
  res.status(200).json({ success: true, data: like });
});

export const createLike = asyncHandler(async (req, res, next) => {
  const likes = await Like.findOne({
    createUser: req.userId,
    post: req.params.id,
  }).exec();
  if (likes == null) {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.userId);

    if (post.createUser == req.userId) {
      post.like += 1;
      post.save();
      req.body.createUser = req.userId;
      req.body.post = req.params.id;
      req.body.name = user.name;
      const like = await Like.create(req.body);

      res.status(200).json({ success: true, data: like });
    } else {
      post.like += 1;
      post.save();
      req.body.createUser = req.userId;
      req.body.post = req.params.id;
      req.body.name = user.name;
      const like = await Like.create(req.body);

      req.body.like = like._id;
      req.body.who = req.userId;
      req.body.for = post.createUser;
      req.body.createUser = req.userId;
      req.body.type = "Like";
      req.body.crud = "Create";
      req.body.postId = req.params.id;
      const user = await User.findById(post.createUser);
      user.save();

      like.name = user.name;
      like.save();

      res.status(200).json({ success: true, data: like });
    }
  } else {
    throw new MyError("Like дарсан байна.", 400);
  }
});

export const updateLike = asyncHandler(async (req, res, next) => {
  const like = await Like.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!like) {
    return res
      .status(400)
      .json({ success: false, error: req.params.id + " ID-тай ажил байхгүй." });
  }
  res.status(200).json({ success: true, data: like });
});

export const deleteLike = asyncHandler(async (req, res, next) => {
  const like = await Like.findOne({
    post: req.params.id,
    createUser: req.userId,
  });
  if (!like) {
    return res
      .status(400)
      .json({ success: false, error: req.params.id + " ID-тай ажил байхгүй." });
  }
  if (like !== null) {
    const post = await Post.findById(req.params.id);

    post.like -= 1;
    post.save();
    like.remove();
  }

  res.status(200).json({ success: true, data: like });
});

export const deleteId = asyncHandler(async (req, res, next) => {
  const like = await Like.findById(req.params.id);
  if (!like) {
    return res
      .status(400)
      .json({ success: false, error: req.params.id + " ID-тай ажил байхгүй." });
  }
  like.remove();

  res.status(200).json({ success: true, data: like });
});
