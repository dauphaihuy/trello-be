import { StatusCodes } from "http-status-codes"
import { boardService } from "~/services/boardService"

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
export const boardController = {
    createNew,
    getDetails,
    update
}