const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Resume upload storage
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireai/resumes",
    allowed_formats: ["pdf", "doc", "docx"],
    resource_type: "raw",
  },
});

// Avatar/profile picture storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hireai/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

exports.uploadResume = multer({ 
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

exports.uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

exports.cloudinary = cloudinary;