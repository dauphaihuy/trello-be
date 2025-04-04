import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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
    try {
        const validation = Joi.object({
            title: Joi.string().strict().min(3).max(30).trim(),
            boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
            cardOrderIds: Joi.array().items(
                Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
            )
        })
        await validation.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
        next()
    } catch (error) {
        const message = new Error(error).message
        const customeErr = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
        next(customeErr)
    }
}
export const columnValidation = {
    createNew,
    update
}