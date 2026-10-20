export const registerFilesHandlers = (io, socket) => {
  // Handlers for client-side file notifications or progress
  socket.on('file:notify-upload', ({ fileRecord }) => {
    const roomId = socket.currentRoomId
    if (!roomId || !fileRecord) return

    socket.to(roomId).emit('file:uploaded', fileRecord)
  })
}
