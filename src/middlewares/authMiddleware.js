import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { jwtProvide } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
    const clientAccessToken = req.cookies?.accessToken
    if (!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'token not found'))
        return
    }
    try {
        // Bước 01: Thực hiện giải mã token xem nó có hợp lệ hay là không
        const accessTokenDecoded = await jwtProvide.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
        console.log('accessTokenDecoded', accessTokenDecoded)
        // Bước 02: Quan trọng: Nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái
        // req.jwtDecoded, để sử dụng cho các tầng cần xử lý phía sau
        req.jwtDecoded = accessTokenDecoded
        // Bước 03: Cho phép gọi request đi tiếp
        next()
    } catch (error) {
        console.log('authMiddleware'.error)
        // Nếu cái accessToken nó bị hết hạn (expired) thì mình cần trả về một cái mã lỗi cho phía FE biết để gọi api refreshToken
        if (error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
            return
        }
        // Nếu như cái accessToken nó không hợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta cứ thẳng tay trả về mã 401 cho phía FE gọi api sign_out luôn
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))

    }
}
export const authMiddleware = { isAuthorized }