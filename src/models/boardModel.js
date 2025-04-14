import { GET_DB } from '~/config/mongodb'
import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { columnModel } from './columnModel '
import { cardModel } from './cardModel'
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().min(3).max(30).trim().strict().required(),
    slug: Joi.string().min(3).trim().strict().required(),
    description: Joi.string().min(3).max(255).trim().strict().required(),
    columnOrderIds: Joi.array().items(Joi.string()).default([]),
    createdAt: Joi.date().timestamp('javascript').default(Date.now()),
    updateAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.bool().default(false)
})

const createNew = async (data) => {
    try {
        const validData = await validBeforeInsert(data)
        const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME)
            .insertOne(validData)
        return createdBoard
    } catch (error) { throw error }
}
const validBeforeInsert = async (data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const findOneById = async (id) => {
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
        return result
    } catch (error) { throw error }
}
const getDetails = async (id) => {
    try {
        // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
        //     _id: new ObjectId(id)
        // })
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            {
                $match: {
                    _id: new ObjectId(id),
                    _destroy: false
                }
            },
            {
                $lookup: {
                    from: columnModel.COLUMN_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'boardId',
                    as: 'columns'
                }
            },
            {
                $lookup: {
                    from: cardModel.CARD_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'boardId',
                    as: 'cards'
                }
            }
        ]).toArray()
        return result[0] || null

    } catch (error) { throw error }
}
const pushColumnOrderIds = async (column) => {
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(column.boardId) }, // Find the document by boardId
            { $push: { columnOrderIds: new ObjectId(column._id) } }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw error }
}
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const update = async (boardId, updateData) => {
    try {
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })

        if (updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(_id => new ObjectId(_id))
        }
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(boardId) }, // Find the document by boardId
            { $set: updateData }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw error }
}
//lay pt ra columnOrderIds

const pullColumnOrderIds = async (column) => {
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(column.boardId) }, // Find the document by boardId
            { $pull: { columnOrderIds: new ObjectId(column._id) } }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw error }
}
export const boardModel = {
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    update,
    pullColumnOrderIds
}