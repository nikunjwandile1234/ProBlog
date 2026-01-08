const express = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");

const router = express.Router();

// View user profile
router.get("/:id", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.id);
    if (!profileUser) return res.status(404).send("User not found");

    const blogs = await Blog.find({ author: profileUser._id, status: "PUBLISHED" });

    res.render("profile/view", {
      profileUser,
      blogs,
      user: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
