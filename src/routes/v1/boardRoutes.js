import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardController } from '~/controllers/boardController'
import { boardValidation } from '~/validations/boardValidation'
const Router = express.Router()
Router.route('/').get((req, res) => {
    res.status(StatusCodes.OK).json({
        message: 'test'
    })
})
    .post(boardValidation.createNew, boardController.createNew)
Router.route('/:id')
    .get(boardValidation.getDetails, boardController.getDetails)
    .put(boardValidation.update, boardController.update)
Router.route('/supports/moving_cards')
    .put(boardValidation.moveCardToDiffColumn, boardController.moveCardToDiffColumn)
export const boardRoute = Router