
import { boardModel } from "~/models/boardModel"
import { columnModel } from "~/models/columnModel "
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
    } catch (error) {
        throw error
    }
}
export const columnService = {
    createNew,
    update
}