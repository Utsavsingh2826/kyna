import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from '../config/cloudinary';
import { Request } from 'express';

/**
 * Image Service
 * Handles image uploads and management for product variants
 */
export class ImageService {
  
  constructor() {
    // Initialize Cloudinary if not already initialized
    if (!cloudinary.config().cloud_name) {
      cloudinary.config({
        cloud_name: CloudinaryConfig.cloudName,
        api_key: CloudinaryConfig.apiKey,
        api_secret: CloudinaryConfig.apiSecret
      });
    }
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'build-your-jewelry'): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'build-your-jewelry'): Promise<{ url: string; publicId: string }[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Generate image URL for product variant
   */
  generateVariantImageUrl(variantId: string, imageType: 'main' | 'thumbnail' | 'variant', index?: number): string {
    const baseUrl = 'https://res.cloudinary.com';
    const cloudName = CloudinaryConfig.cloudName;
    const folder = 'build-your-jewelry';
    
    if (imageType === 'main') {
      return `${baseUrl}/${cloudName}/image/upload/v1/${folder}/${variantId}/main.jpg`;
    } else if (imageType === 'thumbnail') {
      const thumbIndex = index || 1;
      return `${baseUrl}/${cloudName}/image/upload/v1/${folder}/${variantId}/thumb${thumbIndex}.jpg`;
    } else if (imageType === 'variant') {
      const variantIndex = index || 1;
      return `${baseUrl}/${cloudName}/image/upload/v1/${folder}/${variantId}/variant${variantIndex}.jpg`;
    }
    
    return '';
  }

  /**
   * Generate multiple thumbnail URLs for a variant
   */
  generateThumbnailUrls(variantId: string, count: number = 3): string[] {
    const urls: string[] = [];
    for (let i = 1; i <= count; i++) {
      urls.push(this.generateVariantImageUrl(variantId, 'thumbnail', i));
    }
    return urls;
  }

  /**
   * Generate multiple variant URLs for a variant
   */
  generateVariantUrls(variantId: string, count: number = 3): string[] {
    const urls: string[] = [];
    for (let i = 1; i <= count; i++) {
      urls.push(this.generateVariantImageUrl(variantId, 'variant', i));
    }
    return urls;
  }

  /**
   * Transform image URL for different sizes
   */
  transformImageUrl(url: string, width?: number, height?: number, quality: string = 'auto'): string {
    if (!url.includes('cloudinary.com')) {
      return url;
    }

    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      return url;
    }

    let transformations = '';
    if (width || height) {
      transformations = `w_${width || 'auto'},h_${height || 'auto'},c_fill,q_${quality}/`;
    } else {
      transformations = `q_${quality}/`;
    }

    return `${parts[0]}/upload/${transformations}${parts[1]}`;
  }

  /**
   * Generate responsive image URLs
   */
  generateResponsiveUrls(baseUrl: string): {
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
      return {
      small: this.transformImageUrl(baseUrl, 300, 300),
      medium: this.transformImageUrl(baseUrl, 600, 600),
      large: this.transformImageUrl(baseUrl, 1200, 1200),
      original: baseUrl
    };
  }

  /**
   * Get default image URL
   */
  getDefaultImageUrl(): string {
    return 'https://via.placeholder.com/400x400?text=No+Image';
  }

  /**
   * Get category folder path based on SKU for Hostinger VPS
   */
  private getCategoryPath(sku: string): string {
    const skuPrefix = sku.match(/^[A-Z]+/)?.[0] || '';
    
    switch (skuPrefix) {
      case 'BR':
        return 'BRACELETS/ALL BRACELETS';
      
      case 'ER':
        return this.getEarringSubfolder(sku);
      
      case 'FR':
        return this.getFashionRingSubfolder(sku);
      
      case 'GR':
        return this.getGentsRingSubfolder(sku);
      
      case 'ENG':
        return this.getEngagementRingSubfolder(sku);
      
      case 'SR':
        return this.getSolitaireRingSubfolder(sku);
      
      default:
        return 'OTHERS';
    }
  }

  /**
   * Get earring subfolder based on SKU number
   */
  private getEarringSubfolder(sku: string): string {
    const match = sku.match(/ER(\d+)/);
    if (!match) return 'EARINGS/ER1-50';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 50) return 'EARINGS/ER1-50';
    if (num >= 51 && num <= 100) return 'EARINGS/ER51-100';
    if (num >= 101 && num <= 150) return 'EARINGS/ER101-150';
    if (num >= 151 && num <= 200) return 'EARINGS/ER151-200';
    if (num >= 201 && num <= 250) return 'EARINGS/ER201-250';
    if (num >= 251 && num <= 300) return 'EARINGS/ER251-300';
    // Add more ranges as needed
    return 'EARINGS/ER1-50'; // Fallback
  }

  /**
   * Get fashion ring subfolder based on SKU number
   */
  private getFashionRingSubfolder(sku: string): string {
    const match = sku.match(/FR(\d+)/);
    if (!match) return 'FASHION RINGS/FR1-50';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 50) return 'FASHION RINGS/FR1-50';
    if (num >= 51 && num <= 100) return 'FASHION RINGS/FR51-100';
    if (num >= 101 && num <= 150) return 'FASHION RINGS/FR101-150';
    if (num >= 151 && num <= 200) return 'FASHION RINGS/FR151-200';
    if (num >= 201 && num <= 250) return 'FASHION RINGS/FR201-250';
    if (num >= 251 && num <= 300) return 'FASHION RINGS/FR251-300';
    // Add more ranges as needed
    return 'FASHION RINGS/FR1-50'; // Fallback
  }

  /**
   * Get gents ring subfolder based on SKU
   */
  private getGentsRingSubfolder(sku: string): string {
    // Based on your structure, you have specific folders for gents rings
    // You can add more specific logic here based on your actual SKU patterns
    return 'GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB';
  }

  /**
   * Get engagement ring subfolder based on SKU
   */
  private getEngagementRingSubfolder(sku: string): string {
    const match = sku.match(/ENG(\d+)/);
    if (!match) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 10) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10';
    if (num >= 11 && num <= 20) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG11-20';
    if (num >= 21 && num <= 30) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG21-30';
    if (num >= 31 && num <= 40) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG31-40';
    if (num >= 41 && num <= 50) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG41-50';
    if (num >= 51 && num <= 60) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG51-60';
    if (num >= 61 && num <= 70) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG61-70';
    if (num >= 71 && num <= 80) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG71-80';
    if (num >= 81 && num <= 90) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG81-90';
    if (num >= 91 && num <= 100) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG91-100';
    if (num >= 101 && num <= 110) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG101-110';
    if (num >= 111 && num <= 120) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG111-120';
    if (num >= 121 && num <= 130) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG121-130';
    if (num >= 131 && num <= 140) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG131-140';
    if (num >= 141 && num <= 150) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG141-150';
    if (num >= 151 && num <= 160) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG151-160';
    if (num >= 161 && num <= 170) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG161-170';
    if (num >= 171 && num <= 180) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG171-180';
    if (num >= 181 && num <= 190) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG181-190';
    if (num >= 191 && num <= 200) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG191-200';
    if (num >= 201 && num <= 250) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG201-250';
    // Add more ranges as needed
    return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10'; // Fallback
  }

  /**
   * Get solitaire ring subfolder based on SKU
   */
  private getSolitaireRingSubfolder(sku: string): string {
    const match = sku.match(/SR(\d+)/);
    if (!match) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10';
    
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 10) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10';
    if (num >= 11 && num <= 20) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR11-20';
    if (num >= 21 && num <= 30) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR21-30';
    if (num >= 31 && num <= 40) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR31-40';
    if (num >= 41 && num <= 50) return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR41-50';
    // Add more ranges as needed
    return 'SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10'; // Fallback
  }

  /**
   * Build attribute string for filename based on product type and naming conventions
   */
  private buildAttributeString(sku: string, attributes: any): string {
    const skuPrefix = sku.match(/^[A-Z]+/)?.[0] || '';
    const parts: string[] = [];
    
    switch (skuPrefix) {
      case 'ER': // Earrings: ER66-EM-05-WG-AV
        if (attributes.diamondShape) parts.push(attributes.diamondShape);
        if (attributes.diamondSize) parts.push(attributes.diamondSize.toString().padStart(2, '0'));
        if (attributes.metalColour) parts.push(attributes.metalColour);
        if (attributes.view) parts.push(attributes.view);
        break;
        
      case 'ENG': // Engagement: ENG-1-EM-30-18-LG-EFVVS
        if (attributes.diamondShape) parts.push(attributes.diamondShape);
        if (attributes.diamondSize) parts.push(attributes.diamondSize.toString());
        if (attributes.metalType) parts.push(attributes.metalType);
        if (attributes.diamondOrigin) parts.push(attributes.diamondOrigin);
        if (attributes.diamondColour) parts.push(attributes.diamondColour);
        if (attributes.diamondClarity) parts.push(attributes.diamondClarity);
        break;
        
      case 'GR': // Gents Rings: GR1-RD-70-2T-BR-RG-45
        if (attributes.diamondShape) parts.push(attributes.diamondShape);
        if (attributes.diamondSize) parts.push(attributes.diamondSize.toString());
        if (attributes.tone) parts.push(attributes.tone);
        if (attributes.finish) parts.push(attributes.finish);
        if (attributes.metal) parts.push(attributes.metal);
        if (attributes.view) parts.push(attributes.view);
        break;
        
      case 'FR': // Fashion Rings: Similar to gents rings
        if (attributes.diamondShape) parts.push(attributes.diamondShape);
        if (attributes.diamondSize) parts.push(attributes.diamondSize.toString());
        if (attributes.tone) parts.push(attributes.tone);
        if (attributes.finish) parts.push(attributes.finish);
        if (attributes.metal) parts.push(attributes.metal);
        if (attributes.view) parts.push(attributes.view);
        break;
        
      case 'SR': // Solitaire Rings: Similar to engagement rings
        if (attributes.diamondShape) parts.push(attributes.diamondShape);
        if (attributes.diamondSize) parts.push(attributes.diamondSize.toString());
        if (attributes.metalType) parts.push(attributes.metalType);
        if (attributes.diamondOrigin) parts.push(attributes.diamondOrigin);
        if (attributes.diamondColour) parts.push(attributes.diamondColour);
        if (attributes.diamondClarity) parts.push(attributes.diamondClarity);
        break;
        
      case 'BR': // Bracelets: May have different attributes
        if (attributes.material) parts.push(attributes.material);
        if (attributes.size) parts.push(attributes.size);
        if (attributes.clasp) parts.push(attributes.clasp);
        if (attributes.view) parts.push(attributes.view);
        break;
        
      default:
        // Generic attribute building
        if (attributes.diamondShape) parts.push(attributes.diamondShape);
        if (attributes.diamondSize) parts.push(attributes.diamondSize.toString());
        if (attributes.metal) parts.push(attributes.metal);
        if (attributes.tone) parts.push(attributes.tone);
        if (attributes.finish) parts.push(attributes.finish);
        if (attributes.view) parts.push(attributes.view);
        break;
    }
    
    return parts.join('-');
  }

  /**
   * Generate image URLs for a product (Hostinger VPS)
   */
  generateImageUrls(sku: string, attributes: any): any {
    const baseUrl = process.env.IMAGE_BASE_URL || 'https://kynajewels.com/images/RENDERING%20PHOTOS';
    const categoryPath = this.getCategoryPath(sku);
    const attributeString = this.buildAttributeString(sku, attributes);
    const filename = `${sku}-${attributeString}`;
    
      return {
      main: `${baseUrl}/${categoryPath}/${filename}-GP.jpg`,
      thumbnails: [
        `${baseUrl}/${categoryPath}/${filename}-TH1.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-TH2.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-TH3.jpg`
      ]
    };
  }

  /**
   * Generate flexible image URLs for Hostinger VPS
   */
  generateImageUrlsFlexible(sku: string, attributes: any): any {
    const baseUrl = process.env.IMAGE_BASE_URL || 'https://kynajewels.com/images/RENDERING%20PHOTOS';
    const categoryPath = this.getCategoryPath(sku);
    const attributeString = this.buildAttributeString(sku, attributes);
    const filename = `${sku}-${attributeString}`;
    
    return {
      main: `${baseUrl}/${categoryPath}/${filename}-GP.jpg`,
      sub: [
        `${baseUrl}/${categoryPath}/${filename}-SIDE.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-TOP.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-DETAIL.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-LIFESTYLE.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-COMPARISON.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-CUSTOM.jpg`,
        `${baseUrl}/${categoryPath}/${filename}-360.jpg`
      ]
    };
  }
}

export default ImageService;