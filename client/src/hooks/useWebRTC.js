import { useEffect, useRef, useCallback } from 'react'
import SimplePeer from 'simple-peer'
import { useRoomStore } from '../store/room.store'
import { useMediaStore } from '../store/media.store'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
]

export function useWebRTC(socket) {
  const peersRef = useRef(new Map()) // Map<socketId, SimplePeer>
  const analysersRef = useRef(new Map()) // Map<socketId, { context, analyser, source }>
  const statsIntervalRef = useRef(null)
  const audioIntervalRef = useRef(null)

  const { localStream } = useMediaStore()
  const {
    addPeer,
    removePeer,
    updatePeer,
    setPeerStream,
    setActiveSpeakerId,
    peers,
  } = useRoomStore()

  // Destroy peer connection and clean up media analysers
  const destroyPeer = useCallback((socketId) => {
    const peer = peersRef.current.get(socketId)
    if (peer) {
      try {
        peer.destroy()
      } catch (err) {
        console.warn('Error destroying peer:', err)
      }
      peersRef.current.delete(socketId)
    }

    const analyserObj = analysersRef.current.get(socketId)
    if (analyserObj) {
      try {
        analyserObj.source?.disconnect()
        analyserObj.context?.close()
      } catch (err) {
        console.warn('Error closing audio context:', err)
      }
      analysersRef.current.delete(socketId)
    }

    removePeer(socketId)
  }, [removePeer])

  // Set up Audio Analyser for remote stream to detect speaking
  const setupAudioAnalyser = useCallback((socketId, stream) => {
    try {
      const audioTracks = stream.getAudioTracks()
      if (audioTracks.length === 0) return

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return

      const audioContext = new AudioContextClass()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.5

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      analysersRef.current.set(socketId, { context: audioContext, analyser, source })
    } catch (err) {
      console.warn('Could not setup audio analyser for peer:', socketId, err)
    }
  }, [])

  // Create SimplePeer connection instance
  const createPeer = useCallback((targetSocketId, initiator, stream) => {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream: stream || undefined,
      config: { iceServers: ICE_SERVERS },
    })

    peer.on('signal', (signal) => {
      socket.emit('signal:relay', {
        toSocketId: targetSocketId,
        signal,
      })
    })

    peer.on('stream', (remoteStream) => {
      setPeerStream(targetSocketId, remoteStream)
      setupAudioAnalyser(targetSocketId, remoteStream)
    })

    peer.on('error', (err) => {
      console.warn(`[WebRTC Peer Error] ${targetSocketId}:`, err)
      // Attempt ICE restart if peer connection failed
      if (peer._pc && peer._pc.iceConnectionState === 'failed') {
        try {
          peer._pc.restartIce()
        } catch {
          // Ignore
        }
      }
    })

    peer.on('close', () => {
      destroyPeer(targetSocketId)
    })

    peersRef.current.set(targetSocketId, peer)
    return peer
  }, [socket, setPeerStream, setupAudioAnalyser, destroyPeer])

  // Adaptive Bitrate Management & Quality Stats loop
  useEffect(() => {
    statsIntervalRef.current = setInterval(async () => {
      const participantCount = Object.keys(peers).length + 1

      for (const [socketId, peer] of peersRef.current.entries()) {
        if (!peer._pc) continue

        try {
          const stats = await peer._pc.getStats()
          let packetsLost = 0
          let totalPackets = 0
          let roundTripTime = 0

          stats.forEach((report) => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              packetsLost += report.packetsLost || 0
              totalPackets += report.packetsReceived || 0
            }
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              roundTripTime = (report.currentRoundTripTime || 0) * 1000 // in ms
            }
          })

          const lossRatio = totalPackets > 0 ? (packetsLost / totalPackets) * 100 : 0
          let quality = 'good'
          if (lossRatio > 8 || roundTripTime > 350) {
            quality = 'poor'
          } else if (lossRatio > 3 || roundTripTime > 180) {
            quality = 'fair'
          }

          updatePeer(socketId, { connectionQuality: quality })

          // Apply adaptive bitrate via RTCRtpSender
          const senders = peer._pc.getSenders ? peer._pc.getSenders() : []
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video')

          if (videoSender && videoSender.getParameters && videoSender.setParameters) {
            const params = videoSender.getParameters()
            if (!params.encodings || params.encodings.length === 0) {
              params.encodings = [{}]
            }

            // Scale resolution down if room is large to save bandwidth & CPU
            let scaleFactor = 1.0
            let maxBitrate = 1200000 // 1.2 Mbps default

            if (participantCount > 6) {
              scaleFactor = 2.0
              maxBitrate = 400000 // 400 kbps
            } else if (participantCount > 3) {
              scaleFactor = 1.5
              maxBitrate = 750000 // 750 kbps
            }

            // If network loss is high, further reduce bitrate
            if (quality === 'poor') {
              maxBitrate = Math.min(maxBitrate, 300000)
            } else if (quality === 'fair') {
              maxBitrate = Math.min(maxBitrate, 600000)
            }

            params.encodings[0].maxBitrate = maxBitrate
            params.encodings[0].scaleResolutionDownBy = scaleFactor

            await videoSender.setParameters(params).catch(() => null)
          }
        } catch {
          // getStats may throw during connection renegotiation
        }
      }
    }, 5000)

    return () => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current)
    }
  }, [peers, updatePeer])

  // Active Speaker Detection Loop via Web Audio Analysers
  useEffect(() => {
    audioIntervalRef.current = setInterval(() => {
      let loudestSpeakerId = null
      let maxEnergy = -Infinity

      // Analyze remote peers
      for (const [socketId, { analyser }] of analysersRef.current.entries()) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)

        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length

        // Threshold for speaking activity
        if (avg > 25 && avg > maxEnergy) {
          maxEnergy = avg
          loudestSpeakerId = socketId
        }
      }

      setActiveSpeakerId(loudestSpeakerId)
    }, 200)

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current)
    }
  }, [setActiveSpeakerId])

  // Socket signaling event listeners
  useEffect(() => {
    if (!socket) return

    // 1. Initial room join payload with existing peers
    const handleRoomJoined = ({ peers: existingPeers }) => {
      existingPeers.forEach((p) => {
        addPeer(p)
        // Existing peer does not initiate; will receive offer from the new peer
      })
    }

    // 2. New peer joined: we initiate connection
    const handlePeerJoined = ({ peer }) => {
      addPeer(peer)
      createPeer(peer.socketId, true, localStream)
    }

    // 3. Peer left: cleanup
    const handlePeerLeft = ({ socketId }) => {
      destroyPeer(socketId)
    }

    // 4. Signal received (Offer, Answer, ICE candidate)
    const handleSignalReceive = ({ fromSocketId, signal }) => {
      let peer = peersRef.current.get(fromSocketId)
      if (!peer) {
        // Non-initiator creates peer upon receiving initial offer
        peer = createPeer(fromSocketId, false, localStream)
      }
      peer.signal(signal)
    }

    socket.on('room-joined', handleRoomJoined)
    socket.on('peer-joined', handlePeerJoined)
    socket.on('peer-left', handlePeerLeft)
    socket.on('signal:receive', handleSignalReceive)

    return () => {
      socket.off('room-joined', handleRoomJoined)
      socket.off('peer-joined', handlePeerJoined)
      socket.off('peer-left', handlePeerLeft)
      socket.off('signal:receive', handleSignalReceive)

      // Clean up all peers on unmount
      for (const socketId of peersRef.current.keys()) {
        destroyPeer(socketId)
      }
    }
  }, [socket, localStream, addPeer, createPeer, destroyPeer])

  // Replace outgoing tracks on all active peer connections without renegotiation
  const replaceVideoTrack = useCallback(async (newTrack) => {
    for (const peer of peersRef.current.values()) {
      if (!peer._pc) continue
      const senders = peer._pc.getSenders ? peer._pc.getSenders() : []
      const videoSender = senders.find((s) => s.track && s.track.kind === 'video')
      if (videoSender) {
        try {
          await videoSender.replaceTrack(newTrack)
        } catch (err) {
          console.warn('Failed to replace video track on peer:', err)
        }
      }
    }
  }, [])

  return {
    peersRef,
    replaceVideoTrack,
    destroyPeer,
  }
}
