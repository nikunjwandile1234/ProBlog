const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* ============================= */
/* Validate ENV */
/* ============================= */
if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.CLOUDINARY_KEY ||
  !process.env.CLOUDINARY_SECRET
) {
  throw new Error("❌ Cloudinary environment variables are missing");
}

/* ============================= */
/* Config */
/* ============================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/* ============================= */
/* Storage */
/* ============================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "problog",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "image",
    public_id: `blog_${Date.now()}`,
  }),
});

module.exports = { cloudinary, storage };
