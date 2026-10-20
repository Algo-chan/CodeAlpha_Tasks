export const registerSignalHandlers = (io, socket) => {
  // WebRTC Signal exchange: relays simple-peer signals (offer, answer, ICE candidates)
  socket.on('signal:relay', ({ toSocketId, signal }) => {
    if (!toSocketId || !signal) return

    io.to(toSocketId).emit('signal:receive', {
      fromSocketId: socket.id,
      signal,
    })
  })
}
