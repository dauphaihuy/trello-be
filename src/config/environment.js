require('dotenv').config()
export const env = {
    HOST_NAME: process.env.HOST_NAME,
    HOST_NUMBER: process.env.HOST_NUMBER,
    MONGODB_URI: process.env.MONGODB_URI,
    DATABASE_NAME: process.env.DATABASE_NAME
}