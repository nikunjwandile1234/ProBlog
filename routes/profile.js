const express = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");

const router = express.Router();

// View user profile
router.get("/:id", async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.id).select("-password -salt");
    if (!profileUser) return res.status(404).send("User not found");

    const blogs = await Blog.find({
      author: profileUser._id,
      status: "PUBLISHED",
    }).sort({ createdAt: -1 });

    res.render("profile/view", {
      user: req.user,
      profileUser,
      blogs,
    });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;

