/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import { boardRoute } from './boardRoutes'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
const Router = express.Router()

//boards API
Router.use('/boards', boardRoute)
//columns API
Router.use('/columns', columnRoute)
//cards API
Router.use('/cards', cardRoute)
export const APIs_V1 = Router
