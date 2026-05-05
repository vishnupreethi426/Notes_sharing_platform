import mongoose from 'mongoose';

export function initDb(uri) {
  mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });

  return mongoose.connection;
}
