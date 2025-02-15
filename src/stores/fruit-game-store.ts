import { defineStore } from 'pinia'
import { BoxEnum, FruitGame } from '../composables/use-game'

export const useFruitGameStore = defineStore('fruitGame', {
  state: () => ({
    game: new FruitGame(),
    gameState: 'playing' as 'playing' | 'won' | 'lost',
  }),
  getters: {
    boxes: (state) => state.game.boxes,
    firstOpenedIndex: (state) => state.game.firstOpenedIndex,
  },
  actions: {
    openBox(index: number) {
      if (this.gameState !== 'playing') return
      try {
        this.game.openBox(index)
        if (this.game.boxes.every(box => box.isOpen)) {
          this.gameState = this.game.checkGameStatus() === 'won' ? 'won' : 'lost'
        }
      } catch (error: any) {
        alert(error.message)
      }
    },
    setPrediction(index: number, prediction: BoxEnum) {
      if (this.gameState !== 'playing') return
      try {
        this.game.setPrediction(index, prediction)
      } catch (error: any) {
        alert(error.message)
      }
    },
    restartGame() {
      this.game = new FruitGame()
      this.gameState = 'playing'
    },
    saveState() {
      const stateToSave = { game: this.game, gameState: this.gameState }
      localStorage.setItem('fruitGameState', JSON.stringify(stateToSave))
    },
    loadState() {
      const savedState = localStorage.getItem('fruitGameState')
      if (savedState) {
        try {
          const json = JSON.parse(savedState)
          this.game = FruitGame.fromJSON(json.game)
          this.gameState = json.gameState
        } catch {
          this.game = new FruitGame()
          this.gameState = 'playing'
        }
      }
    },
  },
})
