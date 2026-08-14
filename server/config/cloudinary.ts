import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

export function hasCloudinaryConfig(): boolean {
  return Boolean(cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret);
}

cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName || '',
  api_key: cloudinaryConfig.apiKey || '',
  api_secret: cloudinaryConfig.apiSecret || '',
});

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
      return;
    }

    cb(null, true);
  },
});

export const RESOURCE_FOLDERS = {
  'user-profile': 'vendoora/users/profiles',
  'vendor-logo': 'vendoora/vendors/logos',
  'vendor-cover': 'vendoora/vendors/covers',
  'service-cover': 'vendoora/services/covers',
  'inventory-image': 'vendoora/inventory/images',
  'product-image': 'vendoora/marketplace/products',
  'reel-thumbnail': 'vendoora/reels/thumbnails',
} as const;

export type MediaResourceType = keyof typeof RESOURCE_FOLDERS;

export function resolveMediaFolder(resourceType: string): string {
  const folder = RESOURCE_FOLDERS[resourceType as MediaResourceType];

  if (!folder) {
    throw new Error('Unsupported media resource type requested.');
  }

  return folder;
}

export function validateUploadFile(file?: Express.Multer.File): string | null {
  if (!file) {
    return 'No file was provided for upload.';
  }

  if (file.size <= 0) {
    return 'The uploaded file appears to be empty.';
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return 'The uploaded image exceeds the maximum size of 5 MB.';
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return 'Only JPEG, PNG, WebP, and GIF image files are allowed.';
  }

  return null;
}

export async function uploadToCloudinary(file: Express.Multer.File, folder: string) {
  if (!hasCloudinaryConfig()) {
    throw new Error('Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  return new Promise<{ secure_url: string; public_id: string; width?: number; height?: number; format?: string; resource_type: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || 'Cloudinary upload failed.'));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
        });
      },
    );

    stream.end(file.buffer);
  });
}
