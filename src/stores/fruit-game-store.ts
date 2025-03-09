import { defineStore } from 'pinia'
import { BoxEnum, FruitGame } from '../composables/use-game'

export const useFruitGameStore = defineStore('fruitGame', {
  state: () => ({
    game: new FruitGame(),
    gameState: 'playing' as 'playing' | 'won' | 'lost',
    attempts: 1,
    isButtonVisible: false,
  }),
  getters: {
    boxes: (state) => state.game.boxes,
    firstOpenedIndex: (state) => state.game.firstOpenedIndex,
  },
  actions: {
    resetGame() {
      this.game = new FruitGame()
      this.gameState = 'playing'
      this.isButtonVisible = false
    },

    openBox(index: number) {
      if (this.gameState !== 'playing') return
      this.game.openBox(index)
      this.isButtonVisible = true
    },

    setPrediction(index: number, prediction: BoxEnum) {
      if (this.gameState !== 'playing') return
      try {
        this.game.setPrediction(index, prediction)
      } catch (error: any) {
        throw new Error(error.message)
      }
    },

    checkGame() {
      if (this.gameState !== 'playing') return
      try {
        this.game.openRemainingBoxes()
        this.gameState = this.game.checkGameStatus()
      } catch (error: any) {
        throw new Error(error.message)
      }
    },

    restart() {
      this.attempts++
      this.resetGame()
    },
  },
  persist: {
    key: 'fruit-game',
    storage: localStorage,
  },
})
