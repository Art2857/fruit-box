<script lang="ts" setup>
import TWallpaper from '@twallpaper/vue'
import { onMounted, ref, watch } from 'vue'
import Box from './components/box.vue'
import Notification from './components/notification.vue'
import { BoxEnum, FruitGame } from './composables/use-game'
import { useNotification } from './composables/use-notification'
import type { TWallpaperOptions } from '@twallpaper/vue'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import '@twallpaper/vue/css'

const STORAGE_KEY = 'fruitGameState'
const game = ref<FruitGame>(new FruitGame())
const gameState = ref<'playing' | 'won' | 'lost'>('playing')
const { showNotification } = useNotification()
const attempts = ref(1)
const isButtonVisible = ref(false)

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const json = JSON.parse(saved)
      game.value = FruitGame.fromJSON(json.game)
      gameState.value = json.gameState
      attempts.value = json.attempts || 1
    } catch {
      resetGame()
    }
  }
}

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    game: game.value,
    gameState: gameState.value,
    attempts: attempts.value,
  }))
}

function resetGame() {
  game.value = new FruitGame()
  gameState.value = 'playing'
  isButtonVisible.value = false
}

onMounted(loadGame)
watch([game, gameState, attempts], saveGame, { deep: true })

function handleBoxClick(index: number) {
  if (gameState.value !== 'playing') return
  game.value.openBox(index)
  isButtonVisible.value = true
}

function handlePredictionChange(index: number, value: BoxEnum) {
  if (gameState.value !== 'playing') return
  game.value.setPrediction(index, value)
}

function handleCheck() {
  try {
    game.value.openRemainingBoxes()
    gameState.value = game.value.checkGameStatus()
  } catch (error: any) {
    showNotification(error.message)
  }
}

function handleRestart() {
  attempts.value++
  resetGame()
}

const twallpaperOptions = ref<TWallpaperOptions>({
  animate: false,
  colors: ['#90E0EF', '#48CAE4', '#00B4D8', '#0096C7', '#0077B6', '#023E8A'],
  pattern: { mask: false, opacity: 0.3, image: 'https://twallpaper.js.org/patterns/math.svg' },
})
</script>

<template>
  <div v-if="gameState === 'lost'" class="loss-screen fullscreen">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div class="text">
        Ты проиграл
      </div>
      <button class="button" @click="handleRestart">
        Начать заново
      </button>
    </div>
  </div>
  <div v-else-if="gameState === 'won'" class="win-screen fullscreen" style="display: flex; flex-direction: column; align-items: center;">
    <div class="text">
      Ты победил
    </div>
    <div class="text" style="font-size: clamp(32px, 5vw, 48px);">
      {{ `Попыток потрачено: ${attempts}` }}
    </div>
  </div>
  <div v-else class="fullscreen">
    <div class="centered-container">
      <p style="font-size: clamp(2rem, 3.5vw, 2.5rem); text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4);">
        Игра с коробками
      </p>
      <p style="max-width: 80rem; padding-bottom: 20px; font-size: clamp(1rem, 2vw, 1.5rem); text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4);">
        Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и яблоки, и апельсины. Однако все коробки подписаны неправильно. Вам можно достать только один фрукт из любой коробки и по нему определить содержимое остальных.
        <b>Опишите алгоритм, как гарантированно определить, что находится в каждой коробке.</b>
        <br><br>
        <b style="color: #992211;">Вы можете открыть только одну коробку!</b>
      </p>
      <div class="box-container mobile">
        <Box
          v-for="(b, index) in game.boxes"
          :key="index"
          :label="b.label"
          :is-open="b.isOpen"
          :content="b.content"
          :took="b.took"
          :prediction="b.prediction"
          :show-prediction="game.firstOpenedIndex !== null && index !== game.firstOpenedIndex"
          :can-change-prediction="true"
          @click="handleBoxClick(index)"
          @prediction-change="handlePredictionChange(index, $event)"
        />
      </div>
      <div class="button-container" :class="{ visible: isButtonVisible }">
        <button class="button" style="background-color: #023E8A; margin-bottom: 40px;" @click="handleCheck">
          Проверить
        </button>
      </div>
      <TWallpaper :options="twallpaperOptions" />
    </div>
    <Notification />
  </div>
</template>

<style scoped>
button { padding: clamp(12px, 2.5vw, 24px) clamp(24px, 4vw, 36px); font-size: clamp(16px, 2vw, 18px); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@media screen and (max-width: 850px) { .mobile { flex-direction: column; gap: clamp(10px, 2vw, 20px); } }
.text { font-size: clamp(1rem, 5vw, 3rem); text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4); }
.button { display: flex; width: clamp(200px, 30vw, 220px); justify-content: center; border: none; color: #fff; background-color: #9BC53D; border-radius: 8px; cursor: pointer; padding: 10px; }
.centered-container { user-select: none; width: 80%; margin: auto; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.box-container { display: flex; justify-content: center; }
.button-container { opacity: 0; min-height: 100px; }
.button-container.visible { opacity: 1; }
.fullscreen { height: 100vh; align-items: center; justify-content: center; user-select: none; display: flex; font-size: clamp(32px, 5vw, 48px); z-index: 1000; animation: fadeIn 1s ease-in; }
.loss-screen { background-color: #404E4D; color: #fff; }
.win-screen { background-color: #9BC53D; color: #fff; }
</style>
