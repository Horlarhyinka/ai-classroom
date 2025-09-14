import axios from 'axios';
import { getTextExtractor } from 'office-text-extractor';
import { fileTypeFromBuffer } from 'file-type';

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
        const extractor = getTextExtractor();
        resumeText = await extractor.extractText({ input: url, type: 'url' });
      }
    } catch (error) {
      console.log("Couldn't extract", error);
      return;
    }
  
    return resumeText;
  };


  export function cleanTextForTTS(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/`(.*?)`/g, '$1') // Remove code blocks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?;:'"()-]/g, '') // Remove special characters that might cause issues
      .trim();
  }