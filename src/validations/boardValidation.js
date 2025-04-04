import { StatusCodes } from "http-status-codes"
import Joi from "joi"
import ApiError from "~/utils/ApiError"
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
        })
        await validation.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
        next()
    } catch (error) {
        const message = new Error(error).message
        const customeErr = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
        next(customeErr)
    }
}
export const boardValidation = {
    createNew,
    update
}