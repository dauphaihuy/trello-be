import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/board')
    .post(
        authMiddleware.isAuthorized,
        invitationValidation.createNewBoardInvitation,
        invitationController.createNewBoardInvitation
    )
Router.route('/board/:invitationId')
    .put(
        authMiddleware.isAuthorized,
        invitationController.updateBoardInvitation
    )
//lay danh sách nofi theo user
Router.route('/')
    .get(authMiddleware.isAuthorized, invitationController.getInvitations)
export const invitationRoute = Router