import { StatusCodes } from "http-status-codes"
import { cloneDeep } from "lodash"
import { boardModel } from "~/models/boardModel"
import ApiError from "~/utils/ApiError"
import { slugify } from '~/utils/index'
const createNew = async (data) => {
    try {
        const newBoard = {
            ...data,
            slug: slugify(data.title)
        }
        const createdBoard = await boardModel.createNew(newBoard)
        const getNewBoard = await boardModel.getDetails(createdBoard.insertedId)
        return getNewBoard
    } catch (error) {
        throw error
    }
}
const getDetails = async (id) => {
    try {
        const board = await boardModel.getDetails(id)
        if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
        const resBoard = cloneDeep(board)
        resBoard.columns.forEach(column => {
            column.cards = resBoard.cards.filter(card =>
                card.columnId.toString() === column._id.toString())
        })
        delete resBoard.cards
        return resBoard
    } catch (error) {
        throw error
    }
}
const update = async (boardId, reqBody) => {
    try {
        const updateData = {
            ...reqBody,
            updateAt: Date.now()
        }
        const updatedBoard = await boardModel.update(boardId, updateData)
        return updatedBoard
    } catch (error) {
        throw error
    }
}
export const boardService = {
    createNew,
    getDetails,
    update
}