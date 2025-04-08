import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import {
    EMAIL_RULE,
    EMAIL_RULE_MESSAGE,
    PASSWORD_RULE,
    PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
const createNew = async (req, res, next) => {
    console.log('1 userValidation', req.body)
    const correctCondition = Joi.object({
        email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
        password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
    })

    try {
        correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY), new ApiError(error.message)
    }
}

export const userValidation = {
    createNew
}