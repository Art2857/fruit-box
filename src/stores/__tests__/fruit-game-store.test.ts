import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { BOX_TYPES } from '../../composables/use-game'
import { useFruitGameStore } from '../fruit-game-store'

describe('fruitGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with correct default state', () => {
    const store = useFruitGameStore()

    expect(store.gameState).toBe('playing')
    expect(store.attempts).toBe(1)
    expect(store.isButtonVisible).toBe(false)
    expect(store.boxes).toHaveLength(3)
    expect(store.firstOpenedIndex).toBeNull()
  })

  describe('actions', () => {
    it('resetGame should reset state correctly', () => {
      const store = useFruitGameStore()
      store.gameState = 'won'
      store.isButtonVisible = true

      store.resetGame()

      expect(store.gameState).toBe('playing')
      expect(store.isButtonVisible).toBe(false)
      expect(store.firstOpenedIndex).toBeNull()
    })

    it('openBox should update game state', () => {
      const store = useFruitGameStore()

      store.openBox(0)

      expect(store.isButtonVisible).toBe(true)
      expect(store.firstOpenedIndex).toBe(0)
    })

    it('openBox should not work when game is not in playing state', () => {
      const store = useFruitGameStore()
      store.gameState = 'won'

      store.openBox(0)

      expect(store.firstOpenedIndex).toBeNull()
    })

    it('setPrediction should set prediction for closed box', () => {
      const store = useFruitGameStore()

      store.setPrediction(0, BOX_TYPES.APPLE)

      expect(store.boxes[0].prediction).toBe(BOX_TYPES.APPLE)
    })

    it('setPrediction should throw error for opened box', () => {
      const store = useFruitGameStore()
      store.openBox(0)

      expect(() => store.setPrediction(0, BOX_TYPES.APPLE))
        .toThrow('Нельзя делать предсказание для открытой коробки')
    })

    it('setPrediction should not work when game is not in playing state', () => {
      const store = useFruitGameStore()
      store.gameState = 'won'

      // This should not throw an error and just return
      store.setPrediction(0, BOX_TYPES.APPLE)

      // Prediction should not be set
      expect(store.boxes[0].prediction).toBeNull()
    })

    it('checkGame should update game state correctly', () => {
      const store = useFruitGameStore()
      const mixedBoxIndex = store.boxes.findIndex(b => b.label === BOX_TYPES.MIXED)

      store.openBox(mixedBoxIndex)
      store.boxes.forEach((box, index) => {
        if (index !== mixedBoxIndex) {
          store.setPrediction(index, box.content)
        }
      })

      store.checkGame()
      expect(store.gameState).toBe('won')
    })

    it('checkGame should throw error when predictions are missing', () => {
      const store = useFruitGameStore()
      store.openBox(0) // Open a box without setting predictions for others

      expect(() => store.checkGame()).toThrow('Укажите предсказания для всех закрытых коробок')
    })

    it('checkGame should not work when game is not in playing state', () => {
      const store = useFruitGameStore()
      store.gameState = 'won'

      // This should not throw an error and just return
      store.checkGame()

      // State should remain unchanged
      expect(store.gameState).toBe('won')
    })

    it('restart should increment attempts and reset game', () => {
      const store = useFruitGameStore()
      store.gameState = 'won'
      const initialAttempts = store.attempts

      store.restart()

      expect(store.attempts).toBe(initialAttempts + 1)
      expect(store.gameState).toBe('playing')
      expect(store.isButtonVisible).toBe(false)
    })
  })
})
