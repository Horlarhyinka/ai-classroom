// /database/db.js
import mongoose from 'mongoose';

const dbURI = process.env.MONGODB_URL ?? 'localhost:27017/proteus-notebook';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectToDatabase() {
  // prevent multiple connection to db
  if (mongoose.connections[0].readyState) {
    console.log('Connected to MongoDB already');
    return;
  }

  const connect = async () => {
    const maxRetries = 5;
    const retryDelay = 5000;
    for (let count = 1; count <= maxRetries; count++) {
      try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
        return;
      } catch (error) {
        console.error(`MongoDB connection error (attempt ${count}/${maxRetries}):`, error);
        if (count < maxRetries) {
          console.log(`Retrying in ${retryDelay / 1000} seconds...`);
          await delay(retryDelay);
        } else {
          console.error('Max retries reached. Could not connect to MongoDB.');
          throw error;
        }
      }
    }
  };

  connect();
}

export default connectToDatabase;
