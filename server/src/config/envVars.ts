import dotenv from 'dotenv';

dotenv.config({path: `${process.env.NODE_ENV ?? 'development'}.env`})
console.log('env pathway::->', `${process.env.NODE_ENV ?? 'development'}.env`)
export default {
    PORT: process.env.PORT ?? 5000,
    DB_URL: process.env.DB_URL!,
    GEMINI_API_TOKENS: process.env.GEMINI_API_TOKENS!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    ELEVEN_LAB_API_KEY: process.env.ELEVEN_LAB_API_KEY!,
    ELEVEN_LABS_BASE_URL: process.env.ELEVEN_LABS_BASE_URL!, 
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_AUTH_CALLBACK: process.env.GOOGLE_AUTH_CALLBACK!,
    AUTH_REDIRECT_URL: process.env.AUTH_REDIRECT_URL!,
    APP_SECRET: process.env.APP_SECRET!,
    DB_NAME: process.env.DB_NAME!,
    DB_HOST: process.env.DB_HOST!,
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL!,
    APP_BASE_URL: process.env.APP_BASE_URL!,
    VOICE_API_URL: process.env.VOICE_API_URL!,
    VOICE_API_KEY: process.env.VOICE_API_KEY!,
}