const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
// Supports both CLOUDINARY_URL and individual credentials
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if provided (easiest method)
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  // Fall back to individual credentials
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Verify configuration
const verifyCloudinaryConfig = () => {
  const config = cloudinary.config();
  
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.log('⚠️  Cloudinary credentials not configured in .env file');
    console.log('   Add CLOUDINARY_URL or individual credentials');
    return false;
  }
  
  console.log('✅ Cloudinary configured successfully!');
  console.log(`   Cloud Name: ${config.cloud_name}`);
  console.log(`   Storage: 25 GB free tier`);
  return true;
};

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'arroh-water-filter', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' }, // Max size
      { quality: 'auto:good' }, // Auto quality optimization
      { fetch_format: 'auto' } // Auto format (WebP for supported browsers)
    ]
  }
});

// Multer upload configuration
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    console.log('🔍 Extracting public ID from URL:', url);
    
    // Handle different URL formats
    if (!url || typeof url !== 'string') {
      console.error('❌ Invalid URL provided:', url);
      return null;
    }
    
    // Remove query parameters if any
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('/');
    
    // Find the upload part in the URL
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) {
      console.error('❌ "upload" not found in URL parts:', parts);
      return null;
    }
    
    // Get everything after 'upload/v123456/' or 'upload/'
    let pathParts = parts.slice(uploadIndex + 1);
    
    // Skip version if present (starts with 'v' followed by numbers)
    if (pathParts.length > 0 && /^v\d+$/.test(pathParts[0])) {
      pathParts = pathParts.slice(1);
    }
    
    if (pathParts.length === 0) {
      console.error('❌ No path parts found after upload');
      return null;
    }
    
    const fullPath = pathParts.join('/');
    // Remove file extension
    const publicId = fullPath.replace(/\.[^/.]+$/, '');
    
    console.log('✅ Extracted public ID:', publicId);
    return publicId;
  } catch (error) {
    console.error('❌ Error extracting public ID:', error);
    return null;
  }
};

module.exports = { 
  cloudinary, 
  upload, 
  deleteImage, 
  getPublicIdFromUrl,
  verifyCloudinaryConfig 
};
