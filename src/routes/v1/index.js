
import express from 'express'
import { boardRoute } from './boardRoutes'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationsRoute'
const Router = express.Router()

//boards API
Router.use('/boards', boardRoute)
//columns API
Router.use('/columns', columnRoute)
//cards API
Router.use('/cards', cardRoute)
//user API
Router.use('/users', userRoute)
//
Router.use('/invitations', invitationRoute)
export const APIs_V1 = Router
