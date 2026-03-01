import { v2 as cloudinary } from "cloudinary";
import { config } from "../../shared/config/index.js";

cloudinary.config({
   cloud_name: config.cloudinary.cloudName,
  api_key:    config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export { cloudinary };
