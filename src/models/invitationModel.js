const Joi = require('joi')
const { ObjectId } = require('mongodb')
const { GET_DB } = require('~/config/mongodb')
const { INVITATION_TYPES, BOARD_INVITATION_STATUS } = require('~/utils/constants')
const { OBJECT_ID_RULE_MESSAGE, OBJECT_ID_RULE } = require('~/utils/validators')

const INVITATION_COLLECTION_NAME = 'invitations'

const INVITATION_COLLECTION_SCHEMA = Joi.object({
    inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
    boardInvitation: Joi.object({
        board: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        status: Joi.string().valid(...Object.values(BOARD_INVITATION_STATUS))
    }).optional(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updateAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})
// Chỉ định những fields mà chúng ta không muốn cho phép cập nhật trong hàm update
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'createdAt']

const validateBeforeCreate = async (data) => {
    return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNewBoardInvitation = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        // Biến để lưu dữ liệu liên quan tới ObjectId chuẩn chính
        const newInvitationToAdd = {
            ...validData,
            inviterId: new ObjectId(validData.inviterId),
            inviteeId: new ObjectId(validData.inviteeId)
        }

        if (validData.boardInvitation) {
            // nếu không tồn tại dữ liệu boardInvitation thì update cho cái boardId
            newInvitationToAdd.boardInvitation = {
                ...validData.boardInvitation,
                boardId: new ObjectId(validData.boardInvitation.boardId)
            }
        }

        // Ghi insert vào DB
        const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
        return createdInvitation
    }
    catch (error) { throw new Error(error) }
}
const update = async (invitationId, updateData) => {
    try {
        // Xóa những trường không cho phép cập nhật linh tinh
        Object.keys(updateData).forEach((fieldName) => {
            if (INVALID_UPDATE_FIELDS.includes()) {
                delete updateData[fieldName]
            }
        })

        // Nếu có dữ liệu liên quan ObjectId, biến đổi ở đây
        if (updateData.boardInvitation) {
            updateData.boardInvitation = {
                ...updateData.boardInvitation,
                boardId: new ObjectId(updateData.boardInvitation.boardId)
            }
        }

        const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(invitationId) },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        return result
    } catch (error) { throw new Error(error) }
}
export const invitationModel = {
    update,
    createNewBoardInvitation
}