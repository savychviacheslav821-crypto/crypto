const userSchema = require("./userSchema");
const walletSchema = require("../wallet/walletSchema");
const historySchema = require("../history/historySchema");
const httpStatus = require("http-status");
const otherHelper = require("../../helper/others.helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getSetting } = require("../../helper/settings.helper");
const Validator = require("validator");
const userController = {};

userController.Register = async (req, res, next) => {
  try {
    const { wallet } = req.body;
    const user = await walletSchema.findOne({ wallet: wallet });

    if (!user) {
      const newUser = new userSchema();
      await newUser.save();

      const newWallet = new walletSchema();
      newWallet.wallet = wallet;
      newWallet.user = newUser._id;
      await newWallet.save();
    }
    // const data = await walletSchema.findOne({ wallet: wallet}).populate('user');

    const data = await walletSchema.findOne({ wallet: wallet }).populate({
      path: "user",
      populate: [
        {
          path: "following",
          populate: {
            path: "wallets",
          },
        },
        {
          path: "followers",
          populate: {
            path: "wallets",
          },
        },
      ],
    });
    return otherHelper.sendResponse(
      res,
      httpStatus.OK,
      { user: data },
      null,
      "user info"
    );
  } catch (err) {
    next(err);
  }
};

userController.Update = async (req, res, next) => {
  try {
    const { id, name, image, bio, email, facebook, twitter, instagram, web } =
      req.body;
    const user = await userSchema.updateOne(
      { _id: id },
      {
        name: name,
        bio: bio,
        image: image,
        email: email,
        facebook: facebook,
        twitter: twitter,
        instagram: instagram,
        web: web,
      }
    );

    return otherHelper.sendResponse(res, httpStatus.OK, { user: user });
  } catch (err) {
    next(err);
  }
};

userController.GetTotalUserCount = async (req, res, next) => {
  try {
    const data = await userSchema.find().count();
    return otherHelper.sendResponse(res, httpStatus.OK, { total: data });
  } catch (err) {
    next(err);
  }
};

userController.GetFeaturedUsers = async (req, res, next) => {
  try {
    const data = await userSchema.find().populate("wallets").limit(12);
    return otherHelper.sendResponse(res, httpStatus.OK, { users: data });
  } catch (err) {
    next(err);
  }
};

userController.Follow = async (req, res, next) => {
  try {
    const { walletTo, walletFrom, flag } = req.body;
    const walletInfoTo = await walletSchema.findOne({ wallet: walletTo });
    const walletInfoFrom = await walletSchema.findOne({ wallet: walletFrom });

    const userIdTo = walletInfoTo.user;
    const userIdFrom = walletInfoFrom.user;

    const followerAvailable = await userSchema.find({
      _id: userIdTo,
      followers: userIdFrom,
    });

    const followingAvailable = await userSchema.find({
      _id: userIdFrom,
      following: userIdTo,
    });

    if (flag) {
      if (!followerAvailable.length) {
        await userSchema.updateOne(
          { _id: userIdTo },
          {
            $push: {
              followers: userIdFrom,
            },
          }
        );

        await new historySchema({
          type: "Following",
          creator: walletFrom,
          following: userIdTo,
        }).save();
      }

      if (!followingAvailable.length) {
        await userSchema.updateOne(
          { _id: userIdFrom },
          { $push: { following: userIdTo } }
        );
      }
    } else {
      if (followerAvailable.length) {
        // delete
        await userSchema.updateOne(
          { _id: userIdTo },
          { $pull: { followers: userIdFrom } }
        );
      }

      if (followingAvailable.length) {
        // delete
        await userSchema.updateOne(
          { _id: userIdFrom },
          { $pull: { following: userIdTo } }
        );
      }
    }

    return otherHelper.sendResponse(res, httpStatus.OK, { message: "success" });
  } catch (err) {
    next(err);
  }
};

userController.Check = async (req, res, next) => {
  try {
    const { wallet, account } = req.body;

    const walletInfo = await walletSchema.findOne({ wallet: wallet });
    const accountInfo = await walletSchema.findOne({ wallet: account });

    const userId = walletInfo.user;
    const accountId = accountInfo.user;

    const followerAvailable = await userSchema.find({
      _id: userId,
      followers: accountId,
    });

    const flag = followerAvailable.length ? 0 : 1;

    return otherHelper.sendResponse(res, httpStatus.OK, { flag: flag });
  } catch (err) {
    next(err);
  }
};

userController.Search = async (res, req, next) => {
  try {
    return otherHelper.sendResponse(res, httpStatus.OK, { message: "SUCCESS" });
  } catch (err) {
    next(err);
  }
};

userController.SignUp = async (req, res, next) => {
  try {
    const { email, password, phone, wallet, name } = req.body;

    // Validation
    if (!email || !Validator.isEmail(email)) {
      return otherHelper.sendResponse(
        res,
        httpStatus.BAD_REQUEST,
        null,
        { email: "Please provide a valid email address" },
        "Validation error"
      );
    }

    if (!password || password.length < 6) {
      return otherHelper.sendResponse(
        res,
        httpStatus.BAD_REQUEST,
        null,
        { password: "Password must be at least 6 characters long" },
        "Validation error"
      );
    }

    // Check if user already exists
    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return otherHelper.sendResponse(
        res,
        httpStatus.CONFLICT,
        null,
        { email: "User with this email already exists" },
        "User already exists"
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Parse phone number if provided
    let parsedPhone = null;
    if (phone) {
      const phoneResult = otherHelper.parsePhoneNo(phone, "US");
      if (phoneResult.status) {
        parsedPhone = phoneResult.data;
      }
    }

    // Create new user
    const newUser = new userSchema({
      email,
      password: hashedPassword,
      phone: parsedPhone,
      name: name || email.split("@")[0],
    });
    await newUser.save();

    // Create wallet if provided
    if (wallet) {
      const existingWallet = await walletSchema.findOne({ wallet });
      if (!existingWallet) {
        const newWallet = new walletSchema({
          wallet: wallet,
          user: newUser._id,
        });
        await newWallet.save();
      }
    }

    // Generate JWT token
    const secretKey = await getSetting("auth", "token", "secret_key") || "your-secret-key";
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, secretKey, {
      expiresIn: "7d",
    });

    // Return user data without password
    const userData = await userSchema.findById(newUser._id).select("-password");

    return otherHelper.sendResponse(
      res,
      httpStatus.CREATED,
      { user: userData, token },
      null,
      "User registered successfully",
      token
    );
  } catch (err) {
    if (err.code === 11000) {
      return otherHelper.sendResponse(
        res,
        httpStatus.CONFLICT,
        null,
        { email: "User with this email already exists" },
        "User already exists"
      );
    }
    next(err);
  }
};

userController.SignIn = async (req, res, next) => {
  try {
    const { email, password, wallet } = req.body;

    // Validation
    if (!email || !Validator.isEmail(email)) {
      return otherHelper.sendResponse(
        res,
        httpStatus.BAD_REQUEST,
        null,
        { email: "Please provide a valid email address" },
        "Validation error"
      );
    }

    if (!password) {
      return otherHelper.sendResponse(
        res,
        httpStatus.BAD_REQUEST,
        null,
        { password: "Password is required" },
        "Validation error"
      );
    }

    // Find user
    const user = await userSchema.findOne({ email });
    if (!user) {
      return otherHelper.sendResponse(
        res,
        httpStatus.UNAUTHORIZED,
        null,
        { email: "Invalid email or password" },
        "Authentication failed"
      );
    }

    // Check password
    if (!user.password) {
      return otherHelper.sendResponse(
        res,
        httpStatus.UNAUTHORIZED,
        null,
        { email: "Invalid email or password" },
        "Authentication failed"
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return otherHelper.sendResponse(
        res,
        httpStatus.UNAUTHORIZED,
        null,
        { password: "Invalid email or password" },
        "Authentication failed"
      );
    }

    // Update wallet if provided
    if (wallet) {
      const existingWallet = await walletSchema.findOne({ wallet });
      if (!existingWallet) {
        const newWallet = new walletSchema({
          wallet: wallet,
          user: user._id,
        });
        await newWallet.save();
      }
    }

    // Generate JWT token
    const secretKey = await getSetting("auth", "token", "secret_key") || "your-secret-key";
    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
      expiresIn: "7d",
    });

    // Return user data without password
    const userData = await userSchema.findById(user._id).select("-password");
    const walletData = await walletSchema.find({ user: user._id });

    return otherHelper.sendResponse(
      res,
      httpStatus.OK,
      { user: userData, wallets: walletData, token },
      null,
      "Login successful",
      token
    );
  } catch (err) {
    next(err);
  }
};

module.exports = userController;
