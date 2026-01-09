const express = require("express");
const multer = require("multer");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { requireAuth } = require("../middlewares/auth");

// Cloudinary storage
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

const router = express.Router();

/* ============================= */
/* Add blog page */
/* ============================= */
router.get("/add", requireAuth, (req, res) => {
  res.render("blog-add", { user: req.user });
});

/* ============================= */
/* Create blog */
/* ============================= */
router.post("/", requireAuth, upload.single("cover"), async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    if (!title || !content) {
      return res.status(400).send("Title or content missing");
    }

    if (!req.file) {
      return res.status(400).send("Cover image missing");
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const slug = `${baseSlug}-${Date.now()}`;

    const plainText = content.replace(/<[^>]+>/g, "");
    const readingTime = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200));

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      content,
      coverImage: req.file.path,
      author: req.user._id,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      category: category || "General",
      readingTime,
      status: "PUBLISHED"   // ✅ IMPORTANT FIX
    });

    return res.redirect("/blog/" + blog.slug);
  } catch (err) {
    console.error("BLOG CREATE ERROR:", err);
    return res.status(500).send("Error creating blog");
  }
});

/* ============================= */
/* Delete blog */
/* ============================= */
router.post("/delete/:id", requireAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.redirect("/");

    if (
      blog.author.toString() !== req.user._id.toString() &&
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

/* ============================= */
/* Add comment */
/* ============================= */
router.post("/comment/:id", requireAuth, async (req, res) => {
  try {
    if (!req.body.content || !req.body.content.trim()) {
      return res.redirect("back");
    }

    await Comment.create({
      content: req.body.content.trim(),
      blog: req.params.id,
      author: req.user._id,
    });

    res.redirect("back");
  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).send("Failed to add comment");
  }
});

/* ============================= */
/* View blog (MUST BE LAST) */
/* ============================= */
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author");

    if (!blog) return res.status(404).send("Blog not found");

    const comments = await Comment.find({ blog: blog._id })
      .populate("author")
      .sort({ createdAt: -1 });

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

module.exports = router;
