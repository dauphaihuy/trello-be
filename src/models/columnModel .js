import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict(),

    // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
    cardOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

const createNew = async (data) => {
    try {
        const validData = await validBeforeInsert(data)
        const newColumnToAdd = {
            ...validData,
            boardId: new ObjectId(validData.boardId)
        }
        const createdCard = await GET_DB().collection(COLUMN_COLLECTION_NAME)
            .insertOne(newColumnToAdd)
        return createdCard
    } catch (error) { throw error }
}
const validBeforeInsert = async (data) => {
    return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const findOneById = async (id) => {
    try {
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })

        return result
    } catch (error) { throw error }
}
const pushCardOrderIds = async (card) => {
    try {
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(card.columnId) }, // Find the document by boardId
            { $push: { cardOrderIds: new ObjectId(card._id) } }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw error }
}
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']
const update = async (columnId, updateData) => {
    try {
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
        if (updateData.cardOrderIds) {
            updateData.cardOrderIds = updateData.cardOrderIds.map(_id => new ObjectId(_id))
        }
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(columnId) }, // Find the document by boardId
            { $set: updateData }, // Push column ID into the array
            { returnDocument: 'after' } // Return the updated document
        )
        return result
    } catch (error) { throw error }
}

const deleteOneById = async (columnId) => {
    try {
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({
            _id: new ObjectId(columnId)
        })
        return result
    } catch (error) { throw error }
}
export const columnModel = {
    COLUMN_COLLECTION_NAME,
    COLUMN_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    pushCardOrderIds,
    update,
    deleteOneById

}