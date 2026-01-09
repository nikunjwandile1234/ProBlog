const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_KEY ||
  !process.env.CLOUDINARY_SECRET
) {
  throw new Error("❌ Cloudinary environment variables are missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "problog",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],

    // ✅ AUTO COMPRESS & RESIZE
    transformation: [
      { width: 1200, quality: "auto", fetch_format: "auto" }
    ]
  },
});

module.exports = { cloudinary, storage };
