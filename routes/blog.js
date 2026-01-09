const express = require("express");
const multer = require("multer");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { requireAuth } = require("../middlewares/auth");

// Cloudinary storage
const { storage } = require("../config/cloudinary");

// ✅ LIMIT FILE SIZE TO 3MB
const upload = multer({ 
  storage,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

const router = express.Router();

/* =============================
   Add blog page
============================= */
router.get("/add", requireAuth, (req, res) => {
  res.render("blog-add", { user: req.user });
});

/* =============================
   Create blog
============================= */
router.post("/", requireAuth, upload.single("cover"), async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).send("Content missing");
    }

    if (!req.file) {
      return res.status(400).send("Cover image missing");
    }

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
      coverImage: req.file.path,
      author: req.user._id,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      category,
      readingTime,
      status: "PUBLISHED" // ✅ IMPORTANT
    });

    return res.redirect("/blog/" + blog.slug);

  } catch (err) {
    console.error("BLOG CREATE ERROR:", err);
    return res.status(500).send(err.message || "Upload failed");
  }
});

/* =============================
   View blog
============================= */
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
    console.error("BLOG VIEW ERROR:", err);
    res.status(500).send("Server error");
  }
});

/* =============================
   Add comment
============================= */
router.post("/comment/:id", requireAuth, async (req, res) => {
  try {
    await Comment.create({
      content: req.body.content,
      blog: req.params.id,
      author: req.user._id,
    });

    res.redirect("back");
  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).send("Failed to add comment");
  }
});

/* =============================
   Delete blog
============================= */
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
    console.error("DELETE ERROR:", err);
    res.status(500).send("Failed to delete");
  }
});

module.exports = router;
