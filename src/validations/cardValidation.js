import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim()
})
const createNew = async (req, res, next) => {
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const message = new Error(error).message
        const customeErr = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
        next(customeErr)
    }
}
const update = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(3).max(50).trim().strict(),
        description: Joi.string().optional(),
        commentToAdd: Joi.optional(),
        incomingMemberInfo: Joi.optional(),
    })
    try {
        const abortEarly = false // không cho phép dừng nếu có nhiều lỗi validation
        await correctCondition.validateAsync(req.body, { abortEarly })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const cardValidation = {
    createNew,
    update
}