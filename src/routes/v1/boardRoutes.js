import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'
const Router = express.Router()
Router.route('/')
    .get(authMiddleware.isAuthorized, (req, res) => {
        res.status(StatusCodes.OK).json({
            message: 'test'
        })
    }).post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)
Router.route('/:id')
    .get(authMiddleware.isAuthorized, boardValidation.getDetails, boardController.getDetails)
    .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)
Router.route('/supports/moving_cards')
    .put(authMiddleware.isAuthorized, boardValidation.moveCardToDiffColumn, boardController.moveCardToDiffColumn)
export const boardRoute = Router