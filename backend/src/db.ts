import mongoose from 'mongoose';
import "dotenv/config";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};    

export default connectDB;