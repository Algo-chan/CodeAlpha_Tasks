import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react'
import { whiteboardReducer, initialWhiteboardState } from '../../lib/whiteboard.reducer'
import { WhiteboardToolbar } from './WhiteboardToolbar'
import { useToast } from '../ui'

export function Whiteboard({ socket, initialData }) {
  const toast = useToast()
  const canvasRef = useRef(null)
  const cursorCanvasRef = useRef(null)
  const containerRef = useRef(null)

  const [state, dispatch] = useReducer(whiteboardReducer, {
    ...initialWhiteboardState,
    strokes: initialData?.strokes || [],
    shapes: initialData?.shapes || [],
    texts: initialData?.texts || [],
  })

  // Tool states
  const [activeTool, setActiveTool] = useState('pen')
  const [color, setColor] = useState('#007AFF')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStrokePoints, setCurrentStrokePoints] = useState([])
  const [shapeStartPoint, setShapeStartPoint] = useState(null)
  const [remoteCursors, setRemoteCursors] = useState(new Map())

  // Text tool inline input state
  const [textInput, setTextInput] = useState(null) // { x, y, canvasX, canvasY }
  const [textContent, setTextContent] = useState('')

  // Cursor broadcast throttling
  const lastCursorEmitRef = useRef(0)

  // Get normalized coordinates (0 to 1)
  const getNormalizedCoords = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    return { x, y, pixelX: clientX - rect.left, pixelY: clientY - rect.top }
  }

  // Resize canvas to match display size and DPI
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    const cursorCanvas = cursorCanvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.clientWidth
    const height = container.clientHeight
    const dpr = window.devicePixelRatio || 1

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    if (cursorCanvas) {
      cursorCanvas.width = width * dpr
      cursorCanvas.height = height * dpr
      cursorCanvas.style.width = `${width}px`
      cursorCanvas.style.height = `${height}px`
    }

    renderCanvas()
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Canvas Render Engine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width
    const h = canvas.height

    ctx.save()
    ctx.clearRect(0, 0, w, h)

    // Render Strokes
    state.strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width * dpr
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.35 : 1

      const p0 = stroke.points[0]
      ctx.moveTo(p0.x * w, p0.y * h)

      for (let i = 1; i < stroke.points.length; i++) {
        const pt = stroke.points[i]
        ctx.lineTo(pt.x * w, pt.y * h)
      }
      ctx.stroke()
    })

    // Render Geometric Shapes
    state.shapes.forEach((shape) => {
      ctx.beginPath()
      ctx.strokeStyle = shape.color
      ctx.lineWidth = shape.width * dpr
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 1

      const x = shape.x * w
      const y = shape.y * h
      const width = shape.w * w
      const height = shape.h * h

      if (shape.type === 'rectangle') {
        ctx.strokeRect(x, y, width, height)
      } else if (shape.type === 'ellipse') {
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          2 * Math.PI
        )
        ctx.stroke()
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        ctx.moveTo(x, y)
        ctx.lineTo(x + width, y + height)
        ctx.stroke()

        if (shape.type === 'arrow') {
          // Draw Arrowhead
          const angle = Math.atan2(height, width)
          const headlen = 15 * dpr
          ctx.beginPath()
          ctx.moveTo(x + width, y + height)
          ctx.lineTo(
            x + width - headlen * Math.cos(angle - Math.PI / 6),
            y + height - headlen * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(x + width, y + height)
          ctx.lineTo(
            x + width - headlen * Math.cos(angle + Math.PI / 6),
            y + height - headlen * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      }
    })

    // Render Texts
    state.texts.forEach((item) => {
      ctx.font = `${(item.fontSize || 18) * dpr}px -apple-system, sans-serif`
      ctx.fillStyle = item.color
      ctx.globalAlpha = 1
      ctx.fillText(item.content, item.x * w, item.y * h)
    })

    ctx.restore()
  }, [state])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Render Remote Cursors Overlay
  useEffect(() => {
    const cursorCanvas = cursorCanvasRef.current
    if (!cursorCanvas) return
    const ctx = cursorCanvas.getContext('2d')
    const w = cursorCanvas.width
    const h = cursorCanvas.height
    const dpr = window.devicePixelRatio || 1

    ctx.clearRect(0, 0, w, h)

    remoteCursors.forEach((c) => {
      const px = c.x * w
      const py = c.y * h

      // Draw cursor pointer
      ctx.beginPath()
      ctx.arc(px, py, 6 * dpr, 0, 2 * Math.PI)
      ctx.fillStyle = '#007AFF'
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2 * dpr
      ctx.stroke()

      // Draw participant name label
      ctx.font = `${11 * dpr}px -apple-system, sans-serif`
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
      ctx.fillRect(px + 10 * dpr, py - 10 * dpr, ctx.measureText(c.displayName).width + 8 * dpr, 18 * dpr)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(c.displayName, px + 14 * dpr, py + 3 * dpr)
    })
  }, [remoteCursors])

  // Pointer Down
  const handlePointerDown = (e) => {
    const { x, y, pixelX, pixelY } = getNormalizedCoords(e)

    if (activeTool === 'text') {
      setTextInput({ x, y, pixelX, pixelY })
      setTextContent('')
      return
    }

    setIsDrawing(true)

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      setCurrentStrokePoints([{ x, y }])
    } else {
      setShapeStartPoint({ x, y })
    }
  }

  // Pointer Move
  const handlePointerMove = (e) => {
    const { x, y } = getNormalizedCoords(e)

    // Broadcast cursor position (throttled ~30fps)
    const now = Date.now()
    if (now - lastCursorEmitRef.current > 33) {
      socket?.emit('whiteboard:cursor', { x, y })
      lastCursorEmitRef.current = now
    }

    if (!isDrawing) return

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      setCurrentStrokePoints((prev) => [...prev, { x, y }])
    }
  }

  // Pointer Up
  const handlePointerUp = (e) => {
    if (!isDrawing) return
    setIsDrawing(false)

    const { x, y } = getNormalizedCoords(e)

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser') {
      if (currentStrokePoints.length > 1) {
        const strokePayload = {
          id: Math.random().toString(36).substring(2, 9),
          tool: activeTool,
          color: activeTool === 'eraser' ? '#FFFFFF' : color,
          width: activeTool === 'eraser' ? strokeWidth * 3 : strokeWidth,
          points: currentStrokePoints,
        }

        dispatch({ type: 'ADD_STROKE', payload: strokePayload })
        socket?.emit('whiteboard:stroke', strokePayload)
      }
      setCurrentStrokePoints([])
    } else if (shapeStartPoint) {
      const shapePayload = {
        id: Math.random().toString(36).substring(2, 9),
        type: activeTool,
        x: Math.min(shapeStartPoint.x, x),
        y: Math.min(shapeStartPoint.y, y),
        w: activeTool === 'line' || activeTool === 'arrow' ? x - shapeStartPoint.x : Math.abs(x - shapeStartPoint.x),
        h: activeTool === 'line' || activeTool === 'arrow' ? y - shapeStartPoint.y : Math.abs(y - shapeStartPoint.y),
        color,
        width: strokeWidth,
      }

      dispatch({ type: 'ADD_SHAPE', payload: shapePayload })
      socket?.emit('whiteboard:shape', shapePayload)
      setShapeStartPoint(null)
    }
  }

  // Text Input Submit
  const handleTextSubmit = (e) => {
    e?.preventDefault()
    if (!textContent.trim() || !textInput) {
      setTextInput(null)
      return
    }

    const textPayload = {
      id: Math.random().toString(36).substring(2, 9),
      content: textContent.trim(),
      x: textInput.x,
      y: textInput.y,
      color,
      fontSize: Math.max(16, strokeWidth * 4),
    }

    dispatch({ type: 'ADD_TEXT', payload: textPayload })
    socket?.emit('whiteboard:text', textPayload)
    setTextInput(null)
    setTextContent('')
  }

  // Export Canvas as PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary white-background canvas for clean export
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height
    const ctx = exportCanvas.getContext('2d')

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    ctx.drawImage(canvas, 0, 0)

    const dataUrl = exportCanvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `collabroom_whiteboard_${Date.now()}.png`
    link.click()
    toast.success('Whiteboard exported as PNG')
  }

  // Socket listeners for real-time sync
  useEffect(() => {
    if (!socket) return

    const handleRemoteStroke = (stroke) => {
      dispatch({ type: 'ADD_STROKE', payload: stroke })
    }

    const handleRemoteShape = (shape) => {
      dispatch({ type: 'ADD_SHAPE', payload: shape })
    }

    const handleRemoteText = (textItem) => {
      dispatch({ type: 'ADD_TEXT', payload: textItem })
    }

    const handleRemoteClear = () => {
      dispatch({ type: 'CLEAR' })
      toast.info('Whiteboard was cleared')
    }

    const handleRemoteState = (fullState) => {
      dispatch({ type: 'SET_STATE', payload: fullState })
    }

    const handleRemoteCursor = ({ userId, displayName, x, y }) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev)
        next.set(userId, { displayName, x, y, lastSeen: Date.now() })
        return next
      })
    }

    socket.on('whiteboard:stroke', handleRemoteStroke)
    socket.on('whiteboard:shape', handleRemoteShape)
    socket.on('whiteboard:text', handleRemoteText)
    socket.on('whiteboard:clear', handleRemoteClear)
    socket.on('whiteboard:state', handleRemoteState)
    socket.on('whiteboard:remote-cursor', handleRemoteCursor)

    return () => {
      socket.off('whiteboard:stroke', handleRemoteStroke)
      socket.off('whiteboard:shape', handleRemoteShape)
      socket.off('whiteboard:text', handleRemoteText)
      socket.off('whiteboard:clear', handleRemoteClear)
      socket.off('whiteboard:state', handleRemoteState)
      socket.off('whiteboard:remote-cursor', handleRemoteCursor)
    }
  }, [socket, toast])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white dark:bg-neutral-950 overflow-hidden cursor-crosshair select-none"
    >
      {/* Floating Tool Palette */}
      <WhiteboardToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onUndo={() => {
          dispatch({ type: 'UNDO' })
          socket?.emit('whiteboard:undo')
        }}
        onRedo={() => dispatch({ type: 'REDO' })}
        onClear={() => {
          dispatch({ type: 'CLEAR' })
          socket?.emit('whiteboard:clear')
        }}
        onExport={handleExportPNG}
        canUndo={state.undoStack.length > 0}
        canRedo={state.redoStack.length > 0}
      />

      {/* Main Drawing Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 z-10 touch-none"
      />

      {/* Remote Cursors Overlay */}
      <canvas
        ref={cursorCanvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />

      {/* Inline Text Input Placement */}
      {textInput && (
        <form
          onSubmit={handleTextSubmit}
          className="absolute z-40"
          style={{ left: textInput.pixelX, top: textInput.pixelY }}
        >
          <input
            type="text"
            autoFocus
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onBlur={handleTextSubmit}
            placeholder="Type text and press Enter"
            className="px-2 py-1 bg-surface border border-accent rounded shadow-md text-subheadline text-label focus:outline-none"
          />
        </form>
      )}
    </div>
  )
}
