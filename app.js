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

/* ===============================
   DATABASE
================================ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthCookie("token"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

/* ===============================
   HOME
================================ */
app.get("/", async (req, res) => {
  const blogs = await Blog.find({ status: "PUBLISHED" })
    .populate("author")            // ✅ FIX
    .sort({ createdAt: -1 });

  res.render("home", { user: req.user, blogs });
});

/* ===============================
   SEARCH
================================ */
app.get("/search", async (req, res) => {
  const q = req.query.q || "";

  const blogs = await Blog.find({
    title: { $regex: q, $options: "i" },
    status: "PUBLISHED"
  })
    .populate("author")            // ✅ FIX
    .sort({ createdAt: -1 });

  res.render("home", { user: req.user, blogs });
});

/* ===============================
   TAG FILTER
================================ */
app.get("/tag/:tag", async (req, res) => {
  const blogs = await Blog.find({
    tags: req.params.tag,
    status: "PUBLISHED"
  })
    .populate("author")            // ✅ FIX
    .sort({ createdAt: -1 });

  res.render("home", { user: req.user, blogs });
});

/* ===============================
   CATEGORY FILTER
================================ */
app.get("/category/:cat", async (req, res) => {
  const blogs = await Blog.find({
    category: req.params.cat,
    status: "PUBLISHED"
  })
    .populate("author")            // ✅ FIX
    .sort({ createdAt: -1 });

  res.render("home", { user: req.user, blogs });
});

/* ===============================
   ROUTES
================================ */
app.use("/user", userRoutes);
app.use("/blog", blogRoutes);
app.use("/admin", requireAuth, adminRoutes);
app.use("/profile", profileRoutes);

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


