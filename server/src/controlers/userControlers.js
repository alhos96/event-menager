const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");

exports.register = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!/^[a-zA-Z0-9]{1,10}$/.test(name)) {
    if (name.length > 10)
      res.status(400).json({
        message: "Name too long. Maximum 10 characters.",
      });

    res.status(400).json({
      message: "Only letters and numbers allowed!",
    });
    const err = new Error("Too long or has special characters", 400);
    return next(err);
  }

  let existingName;

  try {
    existingName = await User.findOne({ name: name });
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (existingName) {
    res.status(400).json({
      message: "User with that name already exists.",
    });

    const err = new Error("User with that name already exists.", 400);
    return next(err);
  }

  let existingEmail;

  try {
    existingEmail = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to server" });

    const err = new Error("Couldn't connect to server.", 500);
    return next(err);
  }

  if (existingEmail) {
    res.status(400).json({ message: "User with that email already exists." });

    const err = new Error("User with that email already exists.", 400);
    return next(err);
  }

  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(email).toLocaleLowerCase()
    )
  ) {
    res.status(400).json({ message: "That is not correct mail format!" });

    const err = new Error("That is not correct mail format!", 400);
    return next(err);
  }

  if (password !== confirmPassword) {
    res.status(403).json({
      message: "Password don't match",
    });

    const err = new Error("Password don't match", 403);
    return next(err);
  }
  if (password.length < 6) {
    res.status(403).json({
      message: "Password is too short!",
    });

    const err = new Error("Password is too short!", 403);
    return next(err);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    res.status(500).json({ message: "Couldn't hash password. Try again please." });
    const err = new Error("Couldn't hash password. Try again please.", 500);
    return next(err);
  }

  const newUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
  } catch (error) {
    res.status(500).json({ message: "Couldn't create new user, try again." });

    const err = new Error("Could not create new user.", 500);
    return next(err);
  }
  res.status(201).json({ user: newUser });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(email).toLocaleLowerCase()
    )
  ) {
    res.status(400).json({ message: "That is not correct mail format!" });

    const err = new Error("That is not correct mail format!", 400);
    return next(err);
  }

  if (!existingUser) {
    res.status(400).json({
      message: "User with that email don't exist",
    });

    const err = new Error("User with that email don't exist", 400);
    return next(err);
  }

  let enteredPassword;

  try {
    enteredPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (!enteredPassword) {
    res.status(403).json({
      message: "Wrong password!",
    });

    const err = new Error("Wrong password!", 403);
    return next(err);
  }

  let token;

  try {
    token = jwt.sign({ userId: existingUser.id, userName: existingUser.name }, config.secret);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong when hashing pasword!",
    });

    const err = new Error("Something went wrong when hashing pasword!", 500);
    return next(err);
  }

  res.status(201).json({ token: token, name: existingUser.name, email: existingUser.email });
  console.log("User logged in");
};

exports.facebookLogin = async (req, res, next) => {
  const { name, email } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (existingUser) {
    let token;

    try {
      token = jwt.sign({ userId: existingUser.id, userName: existingUser.name }, "jabuka");
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong when hashing pasword!",
      });

      const err = new Error("Something went wrong when hashing pasword!", 500);
      return next(err);
    }

    res.status(201).json({ token: token, name: existingUser.name, email: existingUser.email, message: "logged in" });
  }

  if (!existingUser) {
    const newUser = new User({
      name: name,
      email: email,
      password: "facebook-login",
    });

    try {
      await newUser.save();
    } catch (error) {
      res.status(500).json({ message: "Couldn't create new user, try again." });

      const err = new Error("Could not create new user.", 500);
      return next(err);
    }

    let token;

    try {
      token = jwt.sign({ userId: newUser.id, userName: newUser.name }, "jabuka");
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong when hashing pasword!",
      });

      const err = new Error("Something went wrong when hashing pasword!", 500);
      return next(err);
    }

    res.status(201).json({ token: token, name: newUser.name, email: newUser.email, message: "registered" });
  }
};

exports.editProfile = async (req, res, next) => {
  const { name, email, password, active } = req.body;

  const id = req.userData.userId;

  let existingUser;

  try {
    existingUser = await User.findById(id);
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  let existingName;

  try {
    existingName = await User.findOne({ name: name });
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });
    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (existingName) {
    if (existingName.name !== existingUser.name) {
      res.status(400).json({
        message: "User with that name already exists",
      });
      const err = new Error("User with that name already exists.", 400);
      return next(err);
    }
  }

  let existingEmail;

  try {
    existingEmail = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to server" });
    const err = new Error("Couldn't connect to server.", 500);
    return next(err);
  }

  if (existingEmail) {
    if (existingEmail.email !== existingUser.email) {
      res.status(400).json({ message: "User with that email already exists." });
      const err = new Error("User with that email already exists.", 400);
      return next(err);
    }
  }

  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(email).toLocaleLowerCase()
    )
  ) {
    res.status(400).json({ message: "That is not correct mail format!" });

    const err = new Error("That is not correct mail format!", 400);
    return next(err);
  }

  //user editing his profile

  let areMatchingPasswords;

  try {
    areMatchingPasswords = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (!areMatchingPasswords) {
    res.status(403).json({
      message: "Wrong password!",
    });

    const err = new Error("Wrong password!", 403);
    return next(err);
  }

  let updatedUser = {
    name,
    email,
    password: existingUser.password,
    active,
    _id: id,
  };

  await User.updateOne(existingUser, updatedUser);
  res.json({ name: updatedUser.name, email: updatedUser.email });
};

exports.changePassword = async (req, res, next) => {
  const { newPassword, confirmNewPassword, oldPassword } = req.body;

  const id = req.userData.userId;

  let existingUser = await User.findById(id);

  if (newPassword.length < 6) {
    res.status(403).json({
      message: "Password is too short!",
    });
    const err = new Error("Password is too short!", 403);
    return next(err);
  }

  if (newPassword !== confirmNewPassword) {
    res.status(403).json({
      message: "Password don't match",
    });

    const err = new Error("Password don't match", 403);
    return next(err);
  }

  let areMatchingPasswords;

  try {
    areMatchingPasswords = await bcrypt.compare(oldPassword, existingUser.password);
  } catch (error) {
    res.status(500).json({ message: "Couldn't connect to database" });

    const err = new Error("Couldn't connect to database", 500);
    return next(err);
  }

  if (!areMatchingPasswords) {
    res.status(403).json({
      message: "Wrong password!",
    });

    const err = new Error("Wrong password!", 403);
    return next(err);
  }

  let hashedNewPassword;
  try {
    hashedNewPassword = await bcrypt.hash(newPassword, 12);
  } catch (error) {
    res.status(500).json({ message: "Couldn't hash password. Try again please." });
    const err = new Error("Couldn't hash password. Try again please.", 500);
    return next(err);
  }

  try {
    existingUser.password = hashedNewPassword;
    await existingUser.save();
    res.status(201).json("Password changed!");
  } catch (error) {
    res.status(500).json({ message: "Couldn't change password. Try again please." });
    const err = new Error("Couldn't change password. Try again please.", 500);
    return next(err);
  }
};

exports.getUserInfo = async (req, res, next) => {
  const id = req.userData.userId;

  let info;

  try {
    info = await User.findById(id);
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({
    name: info.name,
    email: info.email,
  });
};
