import mongoose from "mongoose";
import logger from '../scripts/Logger.js';

export const withDefaultDatabase = (mongoUri, databaseName = "receta") => {
    const cleanUri = mongoUri.trim().replace(/^['"]|['"]$/g, "")
    const queryStart = cleanUri.indexOf("?")
    const uriWithoutQuery = queryStart === -1 ? cleanUri : cleanUri.slice(0, queryStart)
    const query = queryStart === -1 ? "" : cleanUri.slice(queryStart)
    const schemeEnd = uriWithoutQuery.indexOf("://")

    if (schemeEnd === -1) {
        return cleanUri
    }

    const authorityStart = schemeEnd + 3
    const pathStart = uriWithoutQuery.indexOf("/", authorityStart)

    if (pathStart === -1) {
        return `${uriWithoutQuery}/${databaseName}${query}`
    }

    const path = uriWithoutQuery.slice(pathStart)
    if (path === "/") {
        return `${uriWithoutQuery.slice(0, pathStart)}/${databaseName}${query}`
    }

    return cleanUri
}

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
        throw new Error("MONGODB_URI is missing in .env")
    }

    mongoose.connection.on('connected', () =>
        //  console.log("Database Connected")
        logger.info("Database Connected")
    )
    mongoose.connection.on('error', (error) => 
        // console.error("Database error:", error.message)
    logger.error("Database error:", error.message)
)

    await mongoose.connect(withDefaultDatabase(mongoUri), {
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 50,
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,
        serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 30000,
        socketTimeoutMS: 45000,
    })
}

export default connectDB
