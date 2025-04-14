import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'
const cloudinaryV2 = cloudinary.v2

cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
})
// khởi tạo funtion để upload file lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        // Tạo một cái stream upload tên cloudinary
        const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        })

        // Thực hiện upload cái stream bằng lib streamifier
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}
export const CloudinaryProvider = { streamUpload }