import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '../providers/BrevoProvider'
import { pickUser } from '~/utils/formatters'
import { jwtProvide } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
const createNew = async (reqBody) => {
    try {
        //ktra email da ton tai hay chua
        const existedUser = await userModel.findOneByEmail(reqBody.email)
        if (existedUser) {
            throw new ApiError(StatusCodes.CONFLICT, 'email already used')
        }
        const nameFromEmail = reqBody.email.split('@')[0]
        const salt = bcryptjs.genSaltSync(10)
        const newUser = {
            email: reqBody.email,
            password: bcryptjs.hashSync(reqBody.password, salt),
            username: nameFromEmail,
            displayName: nameFromEmail,
            verifyToken: uuidv4()
        }
        //luu vao db
        const createdUser = await userModel.createNew(newUser)
        const getNewUser = await userModel.findOneById(createdUser.insertedId)
        //gui email de xac thuc
        const verifycationLink = `${WEBSITE_DOMAIN}/account/verifycation?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
        const customSubject = 'Please verify your email'
        const htmlContent = `
        
        <h3>Hey ${getNewUser.username}!</h3>
        <h3>Click here to verify your email:</h3>
        <a href=${verifycationLink}>
                <img border="0" alt="W3Schools" src="" width="100" height="100">
                </a>
        <h3></h3>
        <h3>Thanks, Vo Quoc Huy</h3>
        `
        await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
        //tra ve du lieu cho controller
        return pickUser(getNewUser)
    } catch (error) {
        throw error
    }
}
const verifyAccount = async (reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
        if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has been activated')
        if (reqBody.token !== existUser.verifyToken) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'token is invalid')
        }
        const updateData = {
            isActive: true,
            verifyToken: null
        }
        //update user
        const updatedUser = await userModel.update(existUser._id, updateData)
        return pickUser(updatedUser)
    } catch (error) { throw error }
}

const login = async (reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has not been activated')
        if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect')
        }
        // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập trả về cho phía FE
        const userInfo = {
            _id: existUser._id,
            email: existUser.email
        }
        const accessToken = await jwtProvide.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            // env.ACCESS_TOKEN_LIFE
            5
        )
        const refreshToken = await jwtProvide.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            // env.REFRESH_TOKEN_LIFE
            15
        )
        // Thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
        // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
        // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
        return { accessToken, refreshToken, ...pickUser(existUser) }
    } catch (error) { throw error }
}
const refreshToken = async (clientRefreshToken) => {
    try {
        // Verify / giải mã token xem có hợp lệ hay không
        const refreshTokenDecoded = await jwtProvide.verifyToken(
            clientRefreshToken,
            env.REFRESH_TOKEN_SECRET_SIGNATURE
        )
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
        }

        const accessToken = await jwtProvide.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            // '1h' // Token life
            5
        )

        return { accessToken }
    } catch (error) {
        throw error
    }
}
export const userService = {
    createNew,
    verifyAccount,
    login,
    refreshToken
}