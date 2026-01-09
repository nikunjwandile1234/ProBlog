const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  content: {
    type: String,
    required: true,
    minlength: 20,
  },

  coverImage: {
    type: String,
    required: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  tags: {
    type: [String],
    default: [],
  },

  category: {
    type: String,
    default: "General",
  },

  views: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["DRAFT", "PUBLISHED"],
    default: "DRAFT",
  },

  readingTime: {
    type: Number,
    default: 1,
  },

}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);

