const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.get("/signin", (req, res) => res.render("signin"));
router.get("/signup", (req, res) => res.render("signup"));

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("signup", { error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.render("signup", { error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.render("signup", { error: "Email already registered" });
    }

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    return res.redirect("/user/signin");

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.render("signup", { error: "Failed to create account" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const token = await User.matchPasswordAndGenerateToken(email, password);

  if (!token) {
    return res.render("signin", { error: "Invalid email or password" });
  }

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
