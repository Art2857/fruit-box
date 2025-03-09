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
    loadState() {
      const savedState = localStorage.getItem('fruitGameState')
      if (savedState) {
        try {
          const json = JSON.parse(savedState)
          this.game = FruitGame.fromJSON(json.game)
          this.gameState = json.gameState
          this.attempts = json.attempts || 1
        } catch {
          this.resetGame()
        }
      }
    },

    saveState() {
      localStorage.setItem('fruitGameState', JSON.stringify({
        game: this.game,
        gameState: this.gameState,
        attempts: this.attempts,
      }))
    },

    resetGame() {
      this.game = new FruitGame()
      this.gameState = 'playing'
      this.isButtonVisible = false
    },

    openBox(index: number) {
      if (this.gameState !== 'playing') return
      this.game.openBox(index)
      this.isButtonVisible = true
      this.saveState()
    },

    setPrediction(index: number, prediction: BoxEnum) {
      if (this.gameState !== 'playing') return
      try {
        this.game.setPrediction(index, prediction)
        this.saveState()
      } catch (error: any) {
        throw new Error(error.message)
      }
    },

    checkGame() {
      if (this.gameState !== 'playing') return
      try {
        this.game.openRemainingBoxes()
        this.gameState = this.game.checkGameStatus()
        this.saveState()
      } catch (error: any) {
        throw new Error(error.message)
      }
    },

    restart() {
      this.attempts++
      this.resetGame()
      this.saveState()
    },
  },
})
