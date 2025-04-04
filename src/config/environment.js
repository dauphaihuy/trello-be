/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
require('dotenv').config()
export const env = {
    HOST_NAME: process.env.HOST_NAME,
    HOST_NUMBER: process.env.HOST_NUMBER,
    MONGODB_URI: process.env.MONGODB_URI,
    DATABASE_NAME: process.env.DATABASE_NAME
}