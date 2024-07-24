import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file if upload operation failed
        }
        console.error("Cloudinary photo upload error:", error);
        return null;
    }
}

const uploadVideoOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "video",
            media_metadata: true,
        })
        // file has been uploaded successfully
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file if upload operation failed
        }
        console.error("Cloudinary video upload error:", error);
        return null;
    }
}

export {uploadOnCloudinary, uploadVideoOnCloudinary}