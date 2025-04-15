import express from 'express'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardValidation } from '~/validations/boardValidation'

const Router = express.Router()
//get all boards
Router.route('/')
    .get(authMiddleware.isAuthorized, boardController.getBoards)
    .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
    .get(authMiddleware.isAuthorized, boardValidation.getDetails, boardController.getDetails)
    .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

Router.route('/supports/moving_cards')
    .put(authMiddleware.isAuthorized, boardValidation.moveCardToDiffColumn, boardController.moveCardToDiffColumn)

export const boardRoute = Router