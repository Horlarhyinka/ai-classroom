import mongoose from 'mongoose';
import logger from 'jet-logger'
import envVars from './envVars';
export const connectDb = async()=>{
    try{
    logger.info('Connecting to DB')
    await mongoose.connect(envVars.DB_URL)
    logger.info('Connected to DB')
    }catch(err){
    logger.err('Failed to connect to DB')
    logger.err(err)
    process.exit(1)
    }
}