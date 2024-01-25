import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file on the cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded successfully
    console.log(`File uploaded on cloudinary successfully`, response.url);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove temporary file locally when the upload on cloudinary fails
    return null;
  }
};

export { uploadOnCloudinary };
