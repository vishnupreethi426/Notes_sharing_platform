import mongoose from 'mongoose';

let cachedConnection = null;

export function initDb(uri) {
  if (cachedConnection) return cachedConnection;

  console.log('Initializing MongoDB connection...');
  
  mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });

  cachedConnection = mongoose.connection;
  return cachedConnection;
}
