import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'


const createNew = async (req, res, next) => {
    try {
        const createdUser = await userService.createNew(req.body)
        return res.status(StatusCodes.CREATED).json(createdUser)
    } catch (error) {
        next(error)
    }
}
const verifyAccount = async (req, res, next) => {
    try {
        const result = await userService.verifyAccount(req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body)
        //  Xử lý trá về http only cookie cho phía trình duyệt
        // * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
        // * Đối với cái maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày,
        // tùy dự án. Lưu ý thời gian sống của cookie khác với cái thời gian sống của token nhé.
        // Đừng bị nhầm lần :D
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: ms('14 days')
        })
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: ms('14 days')
        })
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.status(StatusCodes.OK).json({ loggedOut: true })
    } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
    try {
        const result = await userService.refreshToken(req.cookies?.refreshToken)
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: ms('14 days')
        })
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refreshToken)'))
    }
}
const update = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const updatedUser = await userService.update(userId, req.body)
        res.status(StatusCodes.OK).json(updatedUser)
    } catch (error) { next(error) }
}
export const userController = {
    createNew,
    verifyAccount,
    login,
    logout,
    refreshToken,
    update
}