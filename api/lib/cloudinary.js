import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a base64 data URI or a remote URL to Cloudinary.
 * @param {string} dataUri  - base64 data URI (data:image/...;base64,...)
 * @param {string} folder   - Cloudinary folder name
 * @returns {{ url: string, public_id: string }}
 */
export async function uploadToCloudinary(dataUri, folder = "skyway") {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: result.secure_url, public_id: result.public_id };
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(public_id) {
  if (!public_id) return;
  await cloudinary.uploader.destroy(public_id);
}
