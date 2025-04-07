
import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel '
import ApiError from '~/utils/ApiError'
const createNew = async (data) => {
    try {
        const newColumn = {
            ...data
        }
        const createdColumn = await columnModel.createNew(newColumn)
        const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
        if (getNewColumn) {
            getNewColumn.cards = []
            await boardModel.pushColumnOrderIds(getNewColumn)
        }
        return getNewColumn
    } catch (error) { throw error }
}
const update = async (boardId, reqBody) => {
    try {
        const updateData = {
            ...reqBody,
            updateAt: Date.now()
        }
        const updatedBoard = await columnModel.update(boardId, updateData)
        return updatedBoard
    } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
    try {
        const targetColumn = await columnModel.findOneById(columnId)
        if (!targetColumn) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'targetColumn not found')
        }
        await columnModel.deleteOneById(columnId)
        await cardModel.deleteManyById(columnId)
        await boardModel.pullColumnOrderIds(targetColumn)
        return { deleteResult: 'Column and its Cards deleted successfully' }

    } catch (error) { throw error }
}

export const columnService = {
    createNew,
    update,
    deleteItem
}