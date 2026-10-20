import test from 'node:test'
import assert from 'node:assert/strict'
import { whiteboardReducer, initialWhiteboardState } from '../../client/src/lib/whiteboard.reducer.js'

test('Whiteboard Reducer Unit Tests', async (t) => {
  await t.test('ADD_STROKE adds stroke and updates undo stack', () => {
    const stroke = {
      id: 'stroke-1',
      tool: 'pen',
      color: '#007AFF',
      width: 3,
      points: [{ x: 0.1, y: 0.2 }, { x: 0.2, y: 0.3 }],
    }

    const state = whiteboardReducer(initialWhiteboardState, {
      type: 'ADD_STROKE',
      payload: stroke,
    })

    assert.equal(state.strokes.length, 1)
    assert.equal(state.strokes[0].id, 'stroke-1')
    assert.equal(state.undoStack.length, 1)
    assert.equal(state.redoStack.length, 0)
  })

  await t.test('UNDO and REDO cycle works accurately', () => {
    let state = whiteboardReducer(initialWhiteboardState, {
      type: 'ADD_STROKE',
      payload: { id: 's1', points: [] },
    })
    state = whiteboardReducer(state, {
      type: 'ADD_SHAPE',
      payload: { id: 'sh1', type: 'rectangle', x: 0, y: 0, w: 0.5, h: 0.5 },
    })

    assert.equal(state.strokes.length, 1)
    assert.equal(state.shapes.length, 1)
    assert.equal(state.undoStack.length, 2)

    // Undo shape
    state = whiteboardReducer(state, { type: 'UNDO' })
    assert.equal(state.shapes.length, 0)
    assert.equal(state.strokes.length, 1)
    assert.equal(state.redoStack.length, 1)

    // Redo shape
    state = whiteboardReducer(state, { type: 'REDO' })
    assert.equal(state.shapes.length, 1)
    assert.equal(state.redoStack.length, 0)
  })

  await t.test('CLEAR resets all board strokes, shapes, and texts', () => {
    let state = whiteboardReducer(initialWhiteboardState, {
      type: 'ADD_STROKE',
      payload: { id: 's1', points: [] },
    })
    state = whiteboardReducer(state, {
      type: 'ADD_TEXT',
      payload: { id: 't1', content: 'CollabRoom', x: 0.5, y: 0.5 },
    })

    assert.equal(state.strokes.length, 1)
    assert.equal(state.texts.length, 1)

    state = whiteboardReducer(state, { type: 'CLEAR' })
    assert.equal(state.strokes.length, 0)
    assert.equal(state.texts.length, 0)
    assert.equal(state.undoStack.length, 0)
  })
})
