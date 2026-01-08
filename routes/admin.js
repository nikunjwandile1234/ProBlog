const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const { requireAdmin } = require("../middlewares/admin");

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  const stats = {
    blogs: await Blog.countDocuments(),
    users: await User.countDocuments()
  };
  const blogs = await Blog.find().populate("author");
  res.render("admin/dashboard", { stats, blogs });
});

module.exports = router;
