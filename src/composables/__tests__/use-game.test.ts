import { describe, expect, it, vi } from 'vitest'
import { BOX_TYPES, FRUIT_TYPES, FruitGame } from '../use-game'

describe('fruitGame', () => {
  it('should initialize game with correct state', () => {
    const game = new FruitGame()

    expect(game.boxes).toHaveLength(3)
    expect(game.firstOpenedIndex).toBeNull()
    game.boxes.forEach(box => {
      expect(box.isOpen).toBe(false)
      expect(box.prediction).toBeNull()
      expect(box.took).toBeNull()
    })
  })

  it('should correctly handle box opening', () => {
    const game = new FruitGame()
    game.openBox(1) // Opening mixed box

    expect(game.firstOpenedIndex).toBe(1)
    expect(game.boxes[1].isOpen).toBe(true)
    expect([FRUIT_TYPES.APPLEFRUIT, FRUIT_TYPES.ORANGEFRUIT]).toContain(game.boxes[1].took)
  })

  it('should not allow opening multiple boxes initially', () => {
    const game = new FruitGame()
    game.openBox(0)
    game.openBox(1)

    expect(game.firstOpenedIndex).toBe(0)
    expect(game.boxes[1].isOpen).toBe(false)
  })

  it('should handle predictions correctly', () => {
    const game = new FruitGame()
    game.setPrediction(0, BOX_TYPES.APPLE)

    expect(game.boxes[0].prediction).toBe(BOX_TYPES.APPLE)
  })

  it('should throw error when opening remaining boxes without predictions', () => {
    const game = new FruitGame()
    game.openBox(0)

    expect(() => game.openRemainingBoxes()).toThrow('Укажите предсказания для всех закрытых коробок.')
  })

  it('should correctly determine win condition', () => {
    const game = new FruitGame()

    // First, we need to open the mixed box
    const mixedBoxIndex = game.boxes.findIndex(b => b.label === BOX_TYPES.MIXED)
    game.openBox(mixedBoxIndex)

    // Set correct predictions for remaining boxes
    game.boxes.forEach((box, index) => {
      if (index !== mixedBoxIndex) {
        game.setPrediction(index, box.content)
      }
    })

    game.openRemainingBoxes()
    expect(game.checkGameStatus()).toBe('won')
  })

  it('should correctly determine loss condition when wrong box opened first', () => {
    const game = new FruitGame()
    const appleBoxIndex = game.boxes.findIndex(b => b.label === BOX_TYPES.APPLE)

    game.openBox(appleBoxIndex)
    expect(game.checkGameStatus()).toBe('lost')
  })

  it('should correctly handle JSON serialization', () => {
    const originalGame = new FruitGame()
    originalGame.openBox(0)

    const json = JSON.parse(JSON.stringify(originalGame))
    const restoredGame = FruitGame.fromJSON(json)

    expect(restoredGame.firstOpenedIndex).toBe(originalGame.firstOpenedIndex)
    expect(restoredGame.boxes).toEqual(originalGame.boxes)
  })

  it('should handle fromJSON with null firstOpenedIndex', () => {
    const json = {
      boxes: [
        { label: BOX_TYPES.APPLE, isOpen: false, content: BOX_TYPES.ORANGE, prediction: null, took: null },
        { label: BOX_TYPES.MIXED, isOpen: false, content: BOX_TYPES.APPLE, prediction: null, took: null },
        { label: BOX_TYPES.ORANGE, isOpen: false, content: BOX_TYPES.MIXED, prediction: null, took: null },
      ],
    }

    const game = FruitGame.fromJSON(json)

    expect(game.firstOpenedIndex).toBeNull()
    expect(game.boxes).toEqual(json.boxes)
  })

  it('should not open box if the box is already open', () => {
    const game = new FruitGame()
    game.openBox(1) // Opening mixed box

    expect(game.firstOpenedIndex).toBe(1)
    expect(game.boxes[1].isOpen).toBe(true)

    game.openBox(1) // Trying to open the same box again

    // Should not change the state
    expect(game.firstOpenedIndex).toBe(1)
    expect(game.boxes[1].isOpen).toBe(true)
  })

  it('should set took to APPLEFRUIT when opening APPLE box', () => {
    const game = new FruitGame()
    game.boxes[0].content = BOX_TYPES.APPLE
    game.openBox(0)

    expect(game.boxes[0].took).toBe(FRUIT_TYPES.APPLEFRUIT)
  })

  it('should set took to ORANGEFRUIT when opening ORANGE box', () => {
    const game = new FruitGame()
    game.boxes[0].content = BOX_TYPES.ORANGE
    game.openBox(0)

    expect(game.boxes[0].took).toBe(FRUIT_TYPES.ORANGEFRUIT)
  })

  it('should set took to random fruit when opening MIXED box', () => {
    const game = new FruitGame()
    game.boxes[0].content = BOX_TYPES.MIXED

    // Mock Math.random to return a value less than 0.5
    const originalRandom = Math.random
    Math.random = vi.fn().mockReturnValue(0.3)

    game.openBox(0)
    expect(game.boxes[0].took).toBe(FRUIT_TYPES.APPLEFRUIT)

    // Reset the game and mock Math.random to return a value greater than 0.5
    const game2 = new FruitGame()
    game2.boxes[0].content = BOX_TYPES.MIXED
    Math.random = vi.fn().mockReturnValue(0.7)

    game2.openBox(0)
    expect(game2.boxes[0].took).toBe(FRUIT_TYPES.ORANGEFRUIT)

    // Restore original Math.random
    Math.random = originalRandom
  })

  it('should correctly determine loss condition when predictions are wrong', () => {
    const game = new FruitGame()

    // First, we need to open the mixed box
    const mixedBoxIndex = game.boxes.findIndex(b => b.label === BOX_TYPES.MIXED)
    game.openBox(mixedBoxIndex)

    // Set wrong predictions for remaining boxes
    game.boxes.forEach((box, index) => {
      if (index !== mixedBoxIndex) {
        // Set prediction to something different from the content
        const wrongPrediction = box.content === BOX_TYPES.APPLE ? BOX_TYPES.ORANGE : BOX_TYPES.APPLE
        game.setPrediction(index, wrongPrediction)
      }
    })

    game.openRemainingBoxes()
    expect(game.checkGameStatus()).toBe('lost')
  })
})
