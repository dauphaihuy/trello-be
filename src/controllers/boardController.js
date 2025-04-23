import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { boardService } from '~/services/boardService'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const createdBoard = await boardService.createNew(userId, req.body)
        res.status(StatusCodes.OK).json(createdBoard)
    } catch (error) {
        next(error)
    }
}
const getDetails = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const boardId = req.params.id
        const getBoard = await boardService.getDetails(userId, boardId)
        res.status(StatusCodes.OK).json(getBoard)
    } catch (error) {
        next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const updatedBoard = await boardService.update(req.params.id, req.body)
        res.status(StatusCodes.OK).json(updatedBoard)
    } catch (error) {
        next(error)
    }
}
const moveCardToDiffColumn = async (req, res, next) => {
    try {
        const result = await boardService.moveCardToDiffColumn(req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

const getBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id // Lấy userId từ payload được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
        const { page, itemsPerPage, q } = req.query
        const queryFilters = q
        const results = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)

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