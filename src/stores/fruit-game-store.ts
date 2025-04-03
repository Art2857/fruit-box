import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { FruitGame } from '../composables/use-game'
import type { BoxType } from '../composables/use-game'

export const useFruitGameStore = defineStore('fruitGame', () => {
  const game = ref(new FruitGame())
  const gameState = ref<'playing' | 'won' | 'lost'>('playing')
  const attempts = ref(1)
  const isButtonVisible = ref(false)

  const boxes = computed(() => game.value.boxes)
  const firstOpenedIndex = computed(() => game.value.firstOpenedIndex)

  function resetGame() {
    game.value = new FruitGame()
    gameState.value = 'playing'
    isButtonVisible.value = false
  }

  function openBox(index: number) {
    if (gameState.value !== 'playing') return
    game.value.openBox(index)
    isButtonVisible.value = true
  }

  function setPrediction(index: number, prediction: BoxType) {
    if (gameState.value !== 'playing') return
    if (boxes.value[index].isOpen) {
      throw new Error('Нельзя делать предсказание для открытой коробки')
    }
    game.value.setPrediction(index, prediction)
  }

  function checkGame() {
    if (gameState.value !== 'playing') return
    try {
      game.value.openRemainingBoxes()
      gameState.value = game.value.checkGameStatus()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  function restart() {
    attempts.value++
    resetGame()
  }

  return {

    game,
    gameState,
    attempts,
    isButtonVisible,

    boxes,
    firstOpenedIndex,

    resetGame,
    openBox,
    setPrediction,
    checkGame,
    restart,

    persist: {
      key: 'fruit-game',
      storage: localStorage,
      paths: ['attempts', 'gameState'],
    },
  }
})
