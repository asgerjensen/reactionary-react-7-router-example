/**
 * Transform image URL using Cloudinary for optimization
 * @param imageUrl - Original image URL
 * @param options - Transformation options
 * @returns Cloudinary transformed URL
 */
export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
  gravity?: 'auto' | 'center' | 'face' | 'faces';
}

export function getCloudinaryUrl(
  imageUrl: string,
  options: CloudinaryOptions = {},
  cloudName: string | undefined,
): string {
  // If no Cloudinary cloud name is configured, return original URL
  if (!cloudName) {
    return imageUrl;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformString = transformations.join(',');

  // Encode the original URL
  const encodedUrl = encodeURIComponent(imageUrl);

  // Construct Cloudinary fetch URL
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformString}/${encodedUrl}`;
}
