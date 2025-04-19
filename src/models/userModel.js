
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
const {
    EMAIL_RULE,
    PASSWORD_RULE,
    PASSWORD_RULE_MESSAGE,
    EMAIL_RULE_MESSAGE } = require('~/utils/validators')
// Define tam 2 roles cho user, tùy việc rõ ràng như thế nào mà người có thể thêm role tùy ý sao cho phù hợp sau.
const USER_ROLES = {
    CLIENT: 'client',
    ADMIN: 'admin'
}
const USER_COLLECTION_NAME = 'users'

const USER_COLLECTION_SCHEMA = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required(),
    username: Joi.string().required().trim().strict(),
    displayName: Joi.string().required().trim().strict(),
    avatar: Joi.string().default('null'),
    role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.CLIENT),

    isActive: Joi.boolean().default(false),
    verifyToken: Joi.string(),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data) => {
    return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
//
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']
const findOneById = async (userId) => {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
}
const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
        return createdUser
    } catch (error) {
        throw new Error(error)
    }
}
const findOneByEmail = async (emailValue) => {
    try {
        const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (userId, updateData) => {
    Object.keys(updateData).forEach(fieldName => {
        if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
            delete updateData[fieldName]
        }
    })
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
        { _id: userId },
        { $set: updateData },
        { returnOriginal: false }
    )
    if (!result) {
        throw new Error('Update failed')
    }
    return result
}
export const userModel = {
    USER_COLLECTION_NAME,
    USER_COLLECTION_SCHEMA,
    USER_ROLES,
    createNew,
    findOneById,
    findOneByEmail,
    update
}