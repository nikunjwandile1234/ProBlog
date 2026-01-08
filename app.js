require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { checkForAuthCookie, requireAuth } = require("./middlewares/auth");

const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const adminRoutes = require("./routes/admin");
const profileRoutes = require("./routes/profile");

const Blog = require("./models/blog");

const app = express();
const PORT = process.env.PORT || 8000;


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthCookie("token"));
app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Home
app.get("/", async (req, res) => {
  const blogs = await Blog.find({ status: "PUBLISHED" })
    .populate("author")
    .sort({ createdAt: -1 });

  res.render("home", { user: req.user, blogs });
});

// Search
app.get("/search", async (req, res) => {
  const q = req.query.q || "";
  const blogs = await Blog.find({
    title: { $regex: q, $options: "i" }
  }).populate("author");

  res.render("home", { user: req.user, blogs });
});

// Filters
app.get("/tag/:tag", async (req, res) => {
  const blogs = await Blog.find({ tags: req.params.tag }).populate("author");
  res.render("home", { user: req.user, blogs });
});

app.get("/category/:cat", async (req, res) => {
  const blogs = await Blog.find({ category: req.params.cat }).populate("author");
  res.render("home", { user: req.user, blogs });
});

app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.use("/admin", requireAuth, adminRoutes);
app.use("/profile", profileRoutes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


