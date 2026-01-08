const express = require("express");
const multer = require("multer");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ================= ROUTES =================

// Render add blog page
router.get("/add", requireAuth, (req, res) => {
  res.render("blog-add", { user: req.user });
});

// Create blog
router.post("/", requireAuth, upload.single("cover"), async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    const plainText = content.replace(/<[^>]+>/g, "");
    const readingTime = Math.max(1, Math.ceil(plainText.split(" ").length / 200));

    const blog = await Blog.create({
      title,
      slug,
      content,
      coverImage: "/uploads/" + req.file.filename,
      author: req.user._id,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      category,
      readingTime,
    });

    return res.redirect("/blog/" + blog.slug);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error creating blog");
  }
});

// View single blog
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author");

    if (!blog) return res.status(404).send("Blog not found");

    const comments = await Comment.find({ blog: blog._id }).populate("author");

    res.render("blog-view", {
      user: req.user,
      blog,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Add comment
router.post("/comment/:id", requireAuth, async (req, res) => {
  try {
    await Comment.create({
      content: req.body.content,
      blog: req.params.id,
      author: req.user._id,
    });

    res.redirect("back");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add comment");
  }
});

// Delete blog (author or admin)
router.post("/delete/:id", requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.redirect("/");

    if (
      blog.author.toString() !== req.user._id &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).send("Not allowed");
    }

    await Blog.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ blog: blog._id });

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete");
  }
});

module.exports = router;



