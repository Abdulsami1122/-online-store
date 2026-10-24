import cloudinary from '../config/cloudinary.js';

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return res.status(500).json({
        message: 'Cloudinary credentials are not configured on the server',
      });
    }

    // Convert buffer to base64 Data URI for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'online-store-products',
      resource_type: 'image',
    });

    res.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
};
