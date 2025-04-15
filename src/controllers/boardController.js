import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { boardService } from '~/services/boardService'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
    try {
        const createdBoard = await boardService.createNew(req.body)
        res.status(StatusCodes.OK).json(createdBoard)
    } catch (error) {
        next()
    }
}
const getDetails = async (req, res, next) => {
    try {
        const getBoard = await boardService.getDetails(req.params.id)
        res.status(StatusCodes.OK).json(getBoard)
    } catch (error) {
        throw error
    }
}

const update = async (req, res, next) => {
    try {
        const updatedBoard = await boardService.update(req.params.id, req.body)
        res.status(StatusCodes.OK).json(updatedBoard)
    } catch (error) {
        throw error
    }
}
const moveCardToDiffColumn = async (req, res, next) => {
    try {
        const result = await boardService.moveCardToDiffColumn(req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        throw error
    }
}

const getBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id // Lấy userId từ payload được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
        const { page, itemsPerPage } = req.query
        const results = await boardService.getBoards(userId, page, itemsPerPage)

        res.status(StatusCodes.OK).json(results)
    } catch (error) { next(error) }
}
export const boardController = {
    createNew,
    getDetails,
    update,
    moveCardToDiffColumn,
    getBoards
}