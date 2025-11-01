import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }
    await mongoose.connect(mongoUrl);
    console.log("DB Connected");
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
};


