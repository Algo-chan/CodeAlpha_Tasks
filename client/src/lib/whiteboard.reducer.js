export const initialWhiteboardState = {
  strokes: [],
  shapes: [],
  texts: [],
  undoStack: [],
  redoStack: [],
}

export function whiteboardReducer(state, action) {
  switch (action.type) {
    case 'ADD_STROKE': {
      return {
        ...state,
        strokes: [...state.strokes, action.payload],
        undoStack: [...state.undoStack, { type: 'stroke', id: action.payload.id }],
        redoStack: [],
      }
    }

    case 'ADD_SHAPE': {
      return {
        ...state,
        shapes: [...state.shapes, action.payload],
        undoStack: [...state.undoStack, { type: 'shape', id: action.payload.id }],
        redoStack: [],
      }
    }

    case 'ADD_TEXT': {
      return {
        ...state,
        texts: [...state.texts, action.payload],
        undoStack: [...state.undoStack, { type: 'text', id: action.payload.id }],
        redoStack: [],
      }
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state

      const lastAction = state.undoStack[state.undoStack.length - 1]
      const newUndoStack = state.undoStack.slice(0, -1)

      let removedItem = null
      let newStrokes = state.strokes
      let newShapes = state.shapes
      let newTexts = state.texts

      if (lastAction.type === 'stroke') {
        removedItem = state.strokes.find((s) => s.id === lastAction.id)
        newStrokes = state.strokes.filter((s) => s.id !== lastAction.id)
      } else if (lastAction.type === 'shape') {
        removedItem = state.shapes.find((s) => s.id === lastAction.id)
        newShapes = state.shapes.filter((s) => s.id !== lastAction.id)
      } else if (lastAction.type === 'text') {
        removedItem = state.texts.find((t) => t.id === lastAction.id)
        newTexts = state.texts.filter((t) => t.id !== lastAction.id)
      }

      return {
        ...state,
        strokes: newStrokes,
        shapes: newShapes,
        texts: newTexts,
        undoStack: newUndoStack,
        redoStack: removedItem
          ? [...state.redoStack, { ...lastAction, item: removedItem }]
          : state.redoStack,
      }
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state

      const toRestore = state.redoStack[state.redoStack.length - 1]
      const newRedoStack = state.redoStack.slice(0, -1)

      let newStrokes = state.strokes
      let newShapes = state.shapes
      let newTexts = state.texts

      if (toRestore.type === 'stroke' && toRestore.item) {
        newStrokes = [...state.strokes, toRestore.item]
      } else if (toRestore.type === 'shape' && toRestore.item) {
        newShapes = [...state.shapes, toRestore.item]
      } else if (toRestore.type === 'text' && toRestore.item) {
        newTexts = [...state.texts, toRestore.item]
      }

      return {
        ...state,
        strokes: newStrokes,
        shapes: newShapes,
        texts: newTexts,
        undoStack: [...state.undoStack, { type: toRestore.type, id: toRestore.id }],
        redoStack: newRedoStack,
      }
    }

    case 'CLEAR': {
      return {
        ...state,
        strokes: [],
        shapes: [],
        texts: [],
        undoStack: [],
        redoStack: [],
      }
    }

    case 'SET_STATE': {
      return {
        ...state,
        strokes: action.payload.strokes || [],
        shapes: action.payload.shapes || [],
        texts: action.payload.texts || [],
      }
    }

    default:
      return state
  }
}
