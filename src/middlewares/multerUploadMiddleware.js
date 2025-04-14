import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'
/**
 * Hầu hết những thứ bên dưới đều có docs của multer, chỉ là anh tổ chức lại sao cho khoa học và gọn gàng nhất có thể
 * https://www.npmjs.com/package/multer
 */

// Function kiểm tra loại file được chấp nhận
const customFileFilter = (req, file, callback) => {
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
        return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
    }
    return callback(null, true)
}
// khoi tao function upload được bọc bởi multer
const upload = multer({
    limits: { fieldSize: LIMIT_COMMON_FILE_SIZE },
    fileFilter: customFileFilter
})
export const multerUploadMiddleware = { upload }