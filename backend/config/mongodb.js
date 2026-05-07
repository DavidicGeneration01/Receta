import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log("Database Connected"))
    mongoose.connection.on('error', (error) => console.error("Database error:", error.message))

    await mongoose.connect(`${process.env.MONGODB_URI}/receta`, {
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 50,
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    })
}

export default connectDB
