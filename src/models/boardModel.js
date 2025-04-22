import { GET_DB } from '~/config/mongodb'
import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { columnModel } from './columnModel '
import { cardModel } from './cardModel'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { pagingSkipValue } from '~/utils/algorithms'
import { BOARD_TYPES } from '~/utils/constants'
import { userModel } from './userModel'
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().min(3).max(30).trim().strict().required(),
    slug: Joi.string().min(3).trim().strict().required(),
    description: Joi.string().min(3).max(255).trim().strict().required(),
    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    //admin của board
    ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    // những thành viên của board
    memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    type: Joi.string().allow(BOARD_TYPES),
    createdAt: Joi.date().timestamp('javascript').default(Date.now()),
    updateAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.bool().default(false)
})

const createNew = async (userId, data) => {
    try {
        const validData = await validBeforeInsert(data)
        const newBoardToAdd = {
            ...validData,
            ownerIds: new ObjectId(userId)
        }
        const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME)
            .insertOne(newBoardToAdd)
        return createdBoard
    } catch (error) { throw new Error(error) }
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
const getDetails = async (userId, boardId) => {
    try {
        // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
        //     _id: new ObjectId(id)
        // })
        const queryConditions = [
            { _id: new ObjectId(boardId) },
            { _destroy: false },
            {
                $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } }
                ]
            }
        ]
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            {
                $match: { $and: queryConditions }
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
            },
            {
                $lookup: {
                    from: userModel.USER_COLLECTION_NAME,
                    localField: 'ownerIds',
                    foreignField: '_id',
                    as: 'owners',
                    pipeline: [
                        { $project: { 'password': 0, 'verifyToken': 0 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: userModel.USER_COLLECTION_NAME,
                    localField: 'membersIds',
                    foreignField: '_id',
                    as: 'members',
                    pipeline: [
                        { $project: { 'password': 0, 'verifyToken': 0 } }
                    ]
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
    } catch (error) { throw new Error(error) }
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
const getBoards = async (userId, page, itemsPerPage) => {
    try {
        const queryConditions = [
            //dk 1: board chưa bị xóa
            { _destroy: false },
            //dk 2: userid đang thực hiện request phải thuộc 1 trong 2 mảng ownerIds hoặc memberIds , sd toán tử
            // $all cua mongodb
            {
                $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } }
                ]
            }
        ]
        const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
            [
                { $match: { $and: queryConditions } },
                { $sort: { title: 1 } },
                //$facet để xử lý nhiều luồng trong 1 query
                {
                    $facet: {
                        // luồng 1 :query boards
                        // luồng 2: query đến tầng số lượng tất cả số lượng boards trong db và trả về
                        'queryBoards': [
                            { $skip: pagingSkipValue(page, itemsPerPage) }, //bỏ qua số lượng bản ghi của những page trước đó
                            { $limit: 12 }//giới hạn tối đa số lượng bản ghi tối đa trên 1 page
                        ],
                        'queryTotalBoards': [{ $count: 'countedAllBoards' }]
                    }
                }
            ],
            //khai báo thuộc tính collation locale 'en' để fix chữ B hoa và a thường
            { location: { locale: 'en' } }
        ).toArray()
        const res = query[0]
        return {
            boards: res.queryBoards || [],
            totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
        }
    } catch (error) { throw new Error(error) }
}
const pushMembersIds = async (boardId, userId) => {
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(boardId) }, // Find the document by boardId
            { $push: { memberIds: new ObjectId(userId) } }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw new Error(error) }
}
export const boardModel = {
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    update,
    pullColumnOrderIds,
    getBoards,
    pushMembersIds
}