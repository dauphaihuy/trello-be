import express from 'express'
import { columnController } from '~/controllers/columnController'
import { columnValidation } from '~/validations/columnValidation'
const Router = express.Router()
Router.route('/')
    .get((req, res) => {
        res.status(200).json({ mess: '123' })
    })
    .post(columnValidation.createNew, columnController.createNew)
Router.route('/:id')
    .put(columnValidation.update, columnController.update)
export const columnRoute = Router