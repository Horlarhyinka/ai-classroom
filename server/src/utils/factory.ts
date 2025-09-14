import axios from 'axios';
import fs from 'fs';
import pdfThumbnail from 'pdf-thumbnail';
import { cloudinaryService } from '../services/cloudinary';
// import { getTextExtractor } from 'office-text-extractor';
const getTextExtractor = ()=>import('office-text-extractor')
const fileTypeFromBuffer = async (buffer: Buffer) => {
  const { fileTypeFromBuffer } = await import('file-type');
  return fileTypeFromBuffer(buffer);
};

export const extractFileFromURL = async (url: string) => {
  console.log({fileUrl: url})
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const fileType = await fileTypeFromBuffer(buffer);
  
    let resumeText;
  
    try {
      if (fileType && fileType.mime === 'application/x-cfb') {
        resumeText = buffer.toString().replace(/[^\x20-\x7E]/g, '');
      } else {
        const ext = (await getTextExtractor()); //this resolves my dynamic module
        const extractor = ext.getTextExtractor()
        resumeText = await extractor.extractText({ input: url, type: 'url' });
      }
    } catch (error) {
      console.log("Couldn't extract", error);
      throw error
    }
  
    return resumeText;
  };

  export const generateThumbnailFromPdfFile = async(file: any) =>{
    const fileBuffer = Buffer.from(file.buffer)
    fs.writeFileSync(`/tmp/${file.originalname}`, fileBuffer)
    const thumbnailBuffer = await pdfThumbnail(fs.readFileSync(`/tmp/${file.originalname}`));
    console.log('Thumbnail file res:', thumbnailBuffer)
    // Create a file-like object for upload (using Buffer and filename)
    const thumbnailFile = {
      buffer: thumbnailBuffer,
      originalname: file.originalname?.replace('.pdf', '.jpeg'),
      mimetype: 'image/jpeg'
    };
    console.log({ thumbnailFile })
    const uploadRes = await cloudinaryService.uploadFile(thumbnailFile as any)
    return uploadRes?.secure_url;
  }

  export const retryFn = async(fn: Function, maxRetry = 4 )=>{
    for(let trial = 0; trial < maxRetry;trial++){
      try{
        return await fn()
      }catch(err){
        if(trial == maxRetry){
          throw err
        }
        continue;
      }
    }
  }