const express = require("express");
const router = express.Router();

const { register, login, changePassword, editProfile, getUserInfo, facebookLogin } = require("../controlers/userControlers");
const auth = require("../midleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/facebook-login", facebookLogin);
router.get("/my-profile", auth, getUserInfo);
router.patch("/edit-profile", auth, editProfile);
router.patch("/change-password", auth, changePassword);

module.exports = router;
