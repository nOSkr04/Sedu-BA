const User = require("../models/User");
const Wallet = require("../models/Wallet");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const axios = require("axios");
exports.authMeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new MyError(req.params.id, 401);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// register
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

// логин хийнэ
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Оролтыгоо шалгана

  if (!username || !password) {
    throw new MyError("Имэл болон нууц үйгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const token = user.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    token,
    user: user,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", null, cookieOption).json({
    success: true,
    data: "logged out...",
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, User);

  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа дамжуулна уу", 400);
  }

  const user = await User.findOne({ username: req.body.email });

  if (!user) {
    throw new MyError(req.body.email + " имэйлтэй хэрэглэгч олдсонгүй!", 400);
  }

  const resetToken = user.generatePasswordChangeToken();
  await user.save();

  // await user.save({ validateBeforeSave: false });

  // Имэйл илгээнэ
  const link = `https://amazon.mn/changepassword/${resetToken}`;

  const message = `Сайн байна уу<br><br>Та нууц үгээ солих хүсэлт илгээлээ.<br> Нууц үгээ доорхи линк дээр дарж солино уу:<br><br><a target="_blank" href="${link}">${link}</a><br><br>Өдрийг сайхан өнгөрүүлээрэй!`;

  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг өөрчлөх хүсэлт",
    message,
  });

  console.log("Message sent: %s", info.messageId);

  res.status(200).json({
    success: true,
    resetToken,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Та токен болон нууц үгээ дамжуулна уу", 400);
  }

  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError("Токен хүчингүй байна!", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

exports.invoiceTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
  await axios({
    method: "post",
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: `Basic SUhFTFA6NXNEdkVRazM=`,
    },
  })
    .then((response) => {
      const token = response.data.access_token;

      axios({
        method: "post",
        url: "https://merchant.qpay.mn/v2/invoice",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          invoice_code: "IHELP_INVOICE",
          sender_invoice_no: "12345678",
          invoice_receiver_code: `${profile.username}`,
          invoice_description: `Sedu charge ${profile.username}`,

          amount: req.body.amount,
          callback_url: `http://188.166.244.187/api/v1/users/callbacks/${req.params.id}/${req.body.amount}`,
        },
      })
        .then(async (response) => {
          req.body.urls = response.data.urls;
          req.body.qrImage = response.data.qr_image;
          req.body.invoiceId = response.data.invoice_id;
          const wallet = await Wallet.create(req.body);
          profile.invoiceId = wallet._id;
          profile.save();
          res.status(200).json({
            success: true,
            data: wallet._id,
          });
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    })
    .catch((error) => {
      console.log(error.response.data);
    });
});

exports.chargeTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params._id);
  console.log(req.params);
  if (profile.deadline < Date.now()) {
    if (req.params.numId == 100) {
      profile.deadline = Date.now() + 60 * 60 * 1000 * 24 * 30;
    } else if (req.params.numId == 150) {
      profile.deadline = Date.now() + 60 * 60 * 1000 * 24 * 60;
    } else if (req.params.numId == 200) {
      profile.deadline = Date.now() + 60 * 60 * 1000 * 24 * 90;
    }
  } else {
    if (req.params.numId == 100) {
      profile.deadline = profile.deadline.getTime() + 60 * 60 * 1000 * 24 * 30;
    } else if (req.params.numId == 150) {
      profile.deadline = profile.deadline.getTime() + 60 * 60 * 1000 * 24 * 60;
    } else if (req.params.numId == 200) {
      profile.deadline = profile.deadline.getTime() + 60 * 60 * 1000 * 24 * 90;
    }
  }

  profile.save();

  res.status(200).json({
    success: true,
    data: profile,
  });
});
