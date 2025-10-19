import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

// Upload image buffer to Cloudinary
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder: string = 'kyna-jewels/profiles'
): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload image to Cloudinary'));
          } else if (result) {
            console.log('✅ Image uploaded successfully:', result.secure_url);
            resolve(result.secure_url);
          } else {
            reject(new Error('No result from Cloudinary upload'));
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string => {
  try {
    // Handle full Cloudinary URLs with folder structure
    const match = url.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp)$/i);
    if (match) {
      return match[1];
    }
    
    // Handle URLs without version number
    const simpleMatch = url.match(/\/([^\/]+?)\.(jpg|jpeg|png|gif|webp)$/i);
    if (simpleMatch) {
      return simpleMatch[1];
    }
    
    return '';
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (!publicId) {
      console.warn('No public ID provided for deletion');
      return;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑 Image deleted from Cloudinary:', publicId, result);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw error here as it's not critical for the main operation
  }
};

// Configuration object
const config: CloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

// Validate Cloudinary configuration
if (!config.cloudName || !config.apiKey || !config.apiSecret) {
  console.warn('⚠️ Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
} else {
  console.log('✅ Cloudinary configured successfully for cloud:', config.cloudName);
}

export default cloudinary;
export { config };
