import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
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
        //tra ve du lieu cho controller
        return getNewUser
    } catch (error) {
        throw error
    }
}
export const userService = {
    createNew
}