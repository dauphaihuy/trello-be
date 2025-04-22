
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel '
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (data) => {
    try {
        const newCard = {
            ...data
        }
        const createdCard = await cardModel.createNew(newCard)
        const getNewCard = await cardModel.findOneById(createdCard.insertedId)
        if (getNewCard) {
            getNewCard.cards = []
            await columnModel.pushCardOrderIds(getNewCard)
        }
        return getNewCard
    } catch (error) { throw error }
}
const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
    try {

        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        let updatedCard = {}
        if (cardCoverFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'cover')
            updatedCard = await cardModel.update(cardId, {
                cover: uploadResult.secure_url
            })
        }
        else if (updateData.commentToAdd) {
            const commentData = {
                ...updateData.commentToAdd,
                commentedAt: Date.now(),
                userId: userInfo._id,
                userEmail: userInfo.email,

            }
            updatedCard = await cardModel.unshiftNewComments(cardId, commentData)
        }
        else if (updateData.incomingMemberInfo) {
            //them hoặc xóa thành viên ra khỏi card
            updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
        }
        else {
            //các trường hợp update chung như title description
            updatedCard = await cardModel.update(cardId, updateData)

        }
        return updatedCard
    } catch (error) {
        throw error
    }
}
export const cardService = {
    createNew,
    update
}