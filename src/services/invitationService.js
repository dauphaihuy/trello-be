import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
    try {
        // Người đã mời: chính là inviter -lay id tu token
        const inviter = await userModel.findOneById(inviterId)
        //nguoi duoc moi
        const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
        //tim board để lấy data xử lý
        const board = await boardModel.findOneById(reqBody.boardId)

        // Nếu không tồn tại 1 trong 3 thì sẽ throw reject
        if (!invitee || !inviter || !board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
        }
        const newInvitationData = {
            inviterId,
            inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại dữ liệu ở hàm create
            type: INVITATION_TYPES.BOARD_INVITATION,
            boardInvitation: {
                boardId: board._id.toString(),
                status: BOARD_INVITATION_STATUS.PENDING
            }
        }
        // Gọi sang Model để lưu vào DB
        const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
        const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

        console.log(getInvitation)
        // Ngoài thông tin của cái board invitation mới tạo thì trả về luôn board, inviter, invitee cho FE để hiển thị.
        const resInvitation = {
            ...getInvitation,
            board,
            inviter: pickUser(inviter),
            invitee: pickUser(invitee)
        }
        return resInvitation
    } catch (error) { throw error }
}
const getInvitations = async (userId) => {
    try {
        const getInvitations = await invitationModel.findByUser(userId)
        // các biến inviter invitee và board là đang ở giá trị mảng 1 phần tử,
        //  nên biến đổi về json object trước khi trả về cho fe
        const resInvitations = getInvitations.map(i =>
        ({
            ...i,
            inviter: i.inviter[0] || {},
            invitee: i.invitee[0] || {},
            board: i.board[0] || {}
        })
        )
        return resInvitations
    } catch (error) { throw error }

}
const updateBoardInvitation = async (userId, invitationId, status) => {
    try {
        // Tìm kiếm ban ghi invitation trong model
        const getInvitation = await invitationModel.findOneById(invitationId)
        if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

        // Sau khi có Invitation rồi thì lấy thông tin của board
        const boardId = getInvitation.boardInvitation.boardId
        const getBoard = await boardModel.findOneById(boardId)
        if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

        // Trạng thái xem là ACCEPTED join board mà cái thứ user (invited) đã là owner hoặc member của board thì trả về thông tin board luôn.
        const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
        if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board!')
        }
        //tạo dữ liệu
        const updateData = {
            boardInvitation: {
                ...getInvitation.boardInvitation,
                status: status
            }
        }
        //cập nhật lại dữ liệu
        const updatedInvitation = await invitationModel.update(invitationId, updateData)
        //nếu thành công thì thêm thông tin của user vào memberIds trong collection board
        if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
            await boardModel.pushMembersIds(boardId, userId)
        }
        return updatedInvitation
    } catch (error) { throw error }
}
export const invitationService = { createNewBoardInvitation, getInvitations, updateBoardInvitation }