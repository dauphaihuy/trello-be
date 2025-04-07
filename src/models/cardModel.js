import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().optional(),

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

export const cardModel = {
    CARD_COLLECTION_NAME,
    CARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    update,
    deleteManyById

}