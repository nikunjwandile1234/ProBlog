const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.get("/signin", (req, res) => res.render("signin"));
router.get("/signup", (req, res) => res.render("signup"));

router.post("/signin", async (req, res) => {
  const token = await User.matchPasswordAndGenerateToken(req.body.email, req.body.password);
  if (!token) return res.render("signin", { error: "Invalid credentials" });
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

router.post("/signup", async (req, res) => {
  await User.create(req.body);
  res.redirect("/user/signin");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;

