import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import MyError from "../utils/myError.js";
import paginate from "../utils/paginate.js";

export const getComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Comment.find(req.query));

  const comments = await Comment.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({ success: true, data: comments, pagination });
});

export const getPostComments = asyncHandler(async (req, res, next) => {
  req.query.post = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  // Pagination
  const pagination = await paginate(page, limit, Comment.find(req.query));

  const comments = await Comment.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({ success: true, data: comments, pagination });
});

export const getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new MyError(req.params.id + " ID-тай коммент байхгүй.", 400);
  }

  // comment.name += "-"
  // comment.save(function (err) {
  // if (err) console.log("error: ", err)
  // console.log("saved...")
  // })
  res.status(200).json({ success: true, data: comment });
});

export const createComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (post.createUser == req.userId) {
    post.comment += 1;
    post.save();
    req.body.createUser = req.userId;
    req.body.post = req.params.id;
    const like = await Comment.create(req.body);
    const user = await User.findById(req.body.createUser);
    like.name = user.name;
    like.save();
    res.status(200).json({ success: true, data: like });
  } else {
    post.comment += 1;
    post.save();
    req.body.createUser = req.userId;
    req.body.post = req.params.id;
    const comment = await Comment.create(req.body);
    req.body.comment = comment._id;
    req.body.who = req.userId;
    req.body.for = post.createUser;
    req.body.createUser = req.userId;
    req.body.type = "Comment";
    req.body.crud = "Create";
    req.body.postId = req.params.id;
    req.body.commentBody = req.body.description;
    const user = await User.findById(post.createUser);
    user.save();

    const user1 = await User.findById(req.userId);
    comment.name = user1.name;
    comment.save();

    res.status(200).json({ success: true, data: comment });
  }
});

export const updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!comment) {
    return res
      .status(400)
      .json({
        success: false,
        error: req.params.id + " ID-тай коммент байхгүй.",
      });
  }
  res.status(200).json({ success: true, data: comment });
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  const post = await Post.findById(comment.post);
  post.comment -= 1;
  post.save();

  if (!comment) {
    return res
      .status(400)
      .json({
        success: false,
        error: req.params.id + " ID-тай коммент байхгүй.",
      });
  }
  comment.remove();
  res.status(200).json({ success: true, data: comment });
});
