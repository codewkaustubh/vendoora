import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { uploadToCloudinary, validateUploadFile, resolveMediaFolder, type MediaResourceType, hasCloudinaryConfig } from '../config/cloudinary';

const IMAGE_RESOURCE_TYPES = {
  userProfile: 'user-profile',
  vendorLogo: 'vendor-logo',
  vendorCover: 'vendor-cover',
  serviceCover: 'service-cover',
  inventoryImage: 'inventory-image',
  productImage: 'product-image',
  reelThumbnail: 'reel-thumbnail',
} as const;

function isAllowedResource(resourceType: string): resourceType is keyof typeof IMAGE_RESOURCE_TYPES {
  return Object.prototype.hasOwnProperty.call(IMAGE_RESOURCE_TYPES, resourceType);
}

function getOwnerContext(req: any, resourceType: keyof typeof IMAGE_RESOURCE_TYPES) {
  if (resourceType === 'userProfile') {
    return { userId: req.user.id, model: 'user' as const, ownerRecord: req.user.id };
  }

  if (resourceType === 'vendorLogo' || resourceType === 'vendorCover') {
    return { userId: req.user.id, model: 'vendor' as const, ownerRecord: req.user.id };
  }

  if (resourceType === 'serviceCover') {
    return { userId: req.user.id, model: 'service' as const, ownerRecord: req.user.id };
  }

  if (resourceType === 'inventoryImage') {
    return { userId: req.user.id, model: 'inventory' as const, ownerRecord: req.user.id };
  }

  if (resourceType === 'productImage') {
    return { userId: req.user.id, model: 'product' as const, ownerRecord: req.user.id };
  }

  if (resourceType === 'reelThumbnail') {
    return { userId: req.user.id, model: 'reel' as const, ownerRecord: req.user.id };
  }

  return { userId: req.user.id, model: 'user' as const, ownerRecord: req.user.id };
}

export const uploadMedia = async (req: any, res: Response) => {
  try {
    const resourceType = String(req.body?.resourceType || req.query?.resourceType || '').trim();
    const targetId = String(req.body?.targetId || req.query?.targetId || '').trim();
    const file = req.file as Express.Multer.File | undefined;

    if (!isAllowedResource(resourceType)) {
      return res.status(400).json({ error: 'Unsupported media resource type.' });
    }

    if (!targetId) {
      return res.status(400).json({ error: 'Target identifier is required for media upload.' });
    }

    if (!hasCloudinaryConfig()) {
      return res.status(500).json({ error: 'Cloudinary is not configured on this server.' });
    }

    const validationError = validateUploadFile(file);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const folder = resolveMediaFolder(IMAGE_RESOURCE_TYPES[resourceType]);

    const uploadResult = await uploadToCloudinary(file!, folder);

    if (resourceType === 'userProfile') {
      const user = await prisma.user.findUnique({ where: { id: targetId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      if (user.id !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: You cannot update another user profile image.' });
      }

      await prisma.user.update({ where: { id: user.id }, data: { profileImage: uploadResult.secure_url } });
    }

    if (resourceType === 'vendorLogo' || resourceType === 'vendorCover') {
      const vendor = await prisma.vendor.findUnique({ where: { id: targetId } });
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found.' });
      }
      if (vendor.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another vendor asset.' });
      }

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: resourceType === 'vendorLogo' ? { logo: uploadResult.secure_url } : { coverImage: uploadResult.secure_url },
      });
    }

    if (resourceType === 'serviceCover') {
      const service = await prisma.service.findUnique({ where: { id: targetId } });
      if (!service) {
        return res.status(404).json({ error: 'Service not found.' });
      }

      const vendor = await prisma.vendor.findUnique({ where: { id: service.vendorId } });
      if (!vendor || (vendor.userId !== req.user.id && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another vendor service cover.' });
      }

      await prisma.service.update({ where: { id: service.id }, data: { coverImage: uploadResult.secure_url } });
    }

    if (resourceType === 'inventoryImage') {
      const item = await prisma.inventoryItem.findUnique({ where: { id: targetId } });
      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found.' });
      }

      const vendor = await prisma.vendor.findUnique({ where: { id: item.vendorId } });
      if (!vendor || (vendor.userId !== req.user.id && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another vendor inventory image.' });
      }

      await prisma.inventoryItem.update({ where: { id: item.id }, data: { image: uploadResult.secure_url } });
    }

    if (resourceType === 'productImage') {
      const product = await prisma.product.findUnique({ where: { id: targetId } });
      if (!product) {
        return res.status(404).json({ error: 'Marketplace product not found.' });
      }
      if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another user product image.' });
      }

      await prisma.product.update({ where: { id: product.id }, data: { image: uploadResult.secure_url } });
    }

    if (resourceType === 'reelThumbnail') {
      const reel = await prisma.vibeReel.findUnique({ where: { id: targetId } });
      if (!reel) {
        return res.status(404).json({ error: 'Vibe reel not found.' });
      }

      const vendor = await prisma.vendor.findUnique({ where: { id: reel.vendorId } });
      if (!vendor || (vendor.userId !== req.user.id && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden: You cannot modify another vendor reel thumbnail.' });
      }

      await prisma.vibeReel.update({ where: { id: reel.id }, data: { thumbnail: uploadResult.secure_url } });
    }

    return res.status(200).json({
      message: 'Media uploaded successfully',
      media: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resourceType,
        folder,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Media upload failed.' });
  }
};

export const getMediaUploadStatus = (_req: Request, res: Response) => {
  return res.status(200).json({
    enabled: hasCloudinaryConfig(),
    maxFileSizeBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });
};
