
//lắng nghe sk client emit lên
export const inviteUserToBoardSocket = (socket) => {
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
        console.log('invitation', invitation)
        //emit nguoc lại 1 sự kiện về cho mọi client khác (trừ web gửi request lên) rồi để phía fe check
        socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
    })
}