import { StatusCodes } from "http-status-codes"
import Joi from "joi"
import ApiError from "~/utils/ApiError"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"
const createNew = async (req, res, next) => {
    try {
        const validation = Joi.object({
            title: Joi.string().strict().min(3).max(30).trim().required(),
            description: Joi.string().strict().min(3).max(255).trim().required(),

        })
        await validation.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const message = new Error(error).message
        const customeErr = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
        next(customeErr)
    }
}
const getDetails = async () => {

}
const update = async (req, res, next) => {
    try {
        const validation = Joi.object({
            title: Joi.string().strict().min(3).max(30).trim(),
            description: Joi.string().strict().min(3).max(255).trim(),
            columnOrderIds: Joi.array().items(
                Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
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

const moveCardToDiffColumn = async (req, res, next) => {
    try {
        const validation = Joi.object({
            currentCardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

            prevColumnId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
            prevCardOrderIds: Joi.array().items(
                Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
            ),

            nextColumnIds: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
            nextCardOrderIds: Joi.array().items(
                Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
            )

        })
        console.log(req.body)
        await validation.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const message = new Error(error).message
        const customeErr = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
        next(customeErr)
    }
}
export const boardValidation = {
    createNew,
    update,
    moveCardToDiffColumn
}