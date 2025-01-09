const cloudinary = require('../config/cloudinary.config');
const DatauriParser = require('datauri/parser');
const path = require('path');
const parser = new DatauriParser();

const formatBufferTo64 = (file) => {
  return parser.format(
    path.extname(file.originalname).toString(),
    file.buffer
  ).content;
};

const uploadToCloudinary = async (file, folder = 'mentors') => {
  try {
    const file64 = formatBufferTo64(file);
    const uploadResult = await cloudinary.uploader.upload(file64, {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Error uploading file');
  }
};

module.exports = {
  uploadToCloudinary
}; 