const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const { requireAdmin } = require("../middlewares/admin");

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const stats = {
      blogs: await Blog.countDocuments(),
      users: await User.countDocuments(),
    };

    const blogs = await Blog.find()
      .populate("author")
      .sort({ createdAt: -1 });

    res.render("admin/dashboard", {
      user: req.user,
      stats,
      blogs,
    });
  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).send("Admin panel error");
  }
});

module.exports = router;

