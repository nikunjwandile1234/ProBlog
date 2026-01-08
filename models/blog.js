const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  content: String,
  coverImage: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  tags: [String],
  category: String,

  views: { type: Number, default: 0 },
  status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "PUBLISHED" },
  readingTime: Number,
}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);
