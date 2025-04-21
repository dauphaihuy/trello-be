import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/index'
const createNew = async (userId, reqBody) => {
    try {
        const newBoard = {
            ...reqBody,
            slug: slugify(reqBody.title)
        }
        const createdBoard = await boardModel.createNew(userId, newBoard)
        const getNewBoard = await boardModel.getDetails(createdBoard.insertedId)
        return getNewBoard
    } catch (error) {
        throw error
    }
}
const getDetails = async (userId, boardId) => {
    try {
        console.log(userId, boardId)
        const board = await boardModel.getDetails(userId, boardId)
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
        }
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
const moveCardToDiffColumn = async (reqBody) => {
    try {
        await boardModel.update(reqBody.prevColumnId, {
            cardOrderIds: reqBody.prevCardOrderIds,
            updateAt: Date.now()
        })
        await boardModel.update(reqBody.nextColumnIds, {
            cardOrderIds: reqBody.nextCardOrderIds,
            updateAt: Date.now()
        })
        await cardModel.update(reqBody.currentCardId, {
            columnId: reqBody.nextColumnIds
        })
        return { updateResult: 'Success' }

    } catch (error) { throw error }
}

const getBoards = async (userId, page, itemsPerPage) => {
    try {
        // Nếu không tồn tại itemsPerPage từ phía FE thì BE sẽ cần phải gán giá trị mặc định
        if (!page) page = DEFAULT_PAGE
        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

        const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
        return results
    } catch (error) {
        throw error
    }
}
export const boardService = {
    createNew,
    getDetails,
    update,
    moveCardToDiffColumn,
    getBoards
}