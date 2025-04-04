import { StatusCodes } from "http-status-codes"
import { columnService } from "~/services/columnService"

const createNew = async (req, res, next) => {
    try {
        const createdColumn = await columnService.createNew(req.body)
        res.status(StatusCodes.OK).json(createdColumn)
    } catch (error) { next() }
}
const update = async (req, res, next) => {
    try {
        const updatedBoard = await boardService.update(req.params.id, req.body)
        res.status(StatusCodes.OK).json(updatedBoard)
    } catch (error) {
        throw error
    }
}
export const columnController = {
    createNew,
    update
}