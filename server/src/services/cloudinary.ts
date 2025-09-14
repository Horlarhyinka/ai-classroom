import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import b2s from 'buffer-to-stream';
import envVars from '../config/envVars';
import { retryFn } from '../utils/factory';


class CloudinaryService {
  constructor() {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string = '/project-bolt',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    cloudinary.config({
      api_key: envVars.CLOUDINARY_API_KEY,
      api_secret: envVars.CLOUDINARY_API_SECRET,
      cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
    });

const isImage = file.mimetype.startsWith('image/');
const options = {
  use_filename: true,
  unique_filename: true,
  folder,
  resource_type: isImage ? 'image' : 'raw' as 'image' | 'raw',
};


    return retryFn(async()=> new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result as UploadApiResponse);
      });

      b2s(file.buffer).pipe(uploadStream);
    }))
  }

  async delete(
    public_id: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error: any, result: any) => {
        if (error) {
          console.log(error);
          return reject(error);
        }
        resolve(result);
      });
    });
  }
}

export const cloudinaryService = Object.freeze(new CloudinaryService());
