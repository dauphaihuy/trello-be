import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createNewBoardInvitation = async (req, res, next) => {
    const condition = Joi.object({
        inviteeEmail: Joi.string().required(),
        boardId: Joi.string().required()
    })
    console.log(req.body)
    try {
        await condition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error.message)))
    }
}

export const invitationValidation = {
    createNewBoardInvitation
}