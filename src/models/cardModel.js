import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().optional(),

    cover: Joi.string().default(null),
    memberIds: Joi.array().items(
        Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    userId: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    comments: Joi.array().items({
        userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
        userAvatar: Joi.string(),
        content: Joi.string(),
        commentedAt: Joi.date().timestamp()
    }).default([]),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

const createNew = async (data) => {
    try {
        const validData = await validBeforeInsert(data)
        const newCardToAdd = {
            ...validData,
            boardId: new ObjectId(validData.boardId),
            columnId: new ObjectId(validData.columnId)
        }
        const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME)
            .insertOne(newCardToAdd)
        return createdCard
    } catch (error) { throw error }
}
const validBeforeInsert = async (data) => {
    return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const findOneById = async (id) => {
    try {
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
        return result
    } catch (error) { throw error }
}
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']
const update = async (cardId, updateData) => {
    try {
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
        if (updateData.columnId) updateData.columnId = new ObjectId(updateData.columnId)
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(cardId) }, // Find the document by boardId
            { $set: updateData }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw error }
}

const deleteManyById = async (columnId) => {
    try {
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
            columnId: new ObjectId(columnId)
        })
        return result
    } catch (error) { throw error }
}
//day phan tu vao dau mang
const unshiftNewComments = async (cardId, commentData) => {
    try {
        const result = await GET_DB().collection(CARD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(cardId) },
                { $push: { comments: { $each: [commentData], $position: 0 } } },
                { returnDocument: 'after' }
            )
        return result
    } catch (error) { throw new Error(error) }
}
const updateMembers = async (cardId, incomingMemberInfo) => {
    try {
        let updateCondition = {}
        if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
            // Trường hợp thêm
            updateCondition = { $push: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
        } else if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
            // Trường hợp xóa
            updateCondition = { $pull: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
        }
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(cardId) },
            updateCondition,
            { returnDocument: 'after' }
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
export const cardModel = {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    update,
    deleteManyById,
    unshiftNewComments,
    updateMembers

}