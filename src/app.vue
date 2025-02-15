<script lang="ts" setup>
import TWallpaper from '@twallpaper/vue'
import { onMounted, ref, watch } from 'vue'
import box from './components/box.vue'
import notification from './components/notification.vue'
import { BoxEnum, FruitGame } from './composables/use-game'
import { useNotification } from './composables/use-notification'
import type { TWallpaperOptions } from '@twallpaper/vue'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import '@twallpaper/vue/css'

const STORAGE_KEY = 'fruitGameState'
const game = ref<FruitGame | null>(null)
const gameState = ref<'playing' | 'won' | 'lost'>('playing')
const { showNotification } = useNotification()
const attempts = ref(1)
function loadGame() {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    try {
      const json = JSON.parse(savedState)
      game.value = FruitGame.fromJSON(json.game)
      gameState.value = json.gameState
      attempts.value = json.attempts || 1
    } catch {
      game.value = new FruitGame()
      gameState.value = 'playing'
      attempts.value = 1
    }
  } else {
    game.value = new FruitGame()
    gameState.value = 'playing'
    attempts.value = 1
  }
}
onMounted(loadGame)
watch([game, gameState, attempts], () => {
  if (game.value) {
    const stateToSave = { game: game.value, gameState: gameState.value, attempts: attempts.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  }
}, { deep: true })
function handleBoxClick(index: number) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    game.value.openBox(index)
  } catch (error: any) {
    showNotification(error.message)
  }
}
function handlePredictionChange(index: number, value: BoxEnum) {
  if (!game.value || gameState.value !== 'playing') return
  try {
    game.value.setPrediction(index, value)
  } catch (error: any) {
    showNotification(error.message)
  }
}
function handleCheck() {
  if (!game.value) return
  try {
    game.value.openRemainingBoxes()
    gameState.value = game.value.checkGameStatus()
  } catch (error: any) {
    showNotification(error.message)
  }
}
function handleRestart() {
  attempts.value++
  localStorage.removeItem(STORAGE_KEY)
  game.value = new FruitGame()
  gameState.value = 'playing'
}
const canChangePrediction = ref(true)
const twallpaper = ref<InstanceType<typeof TWallpaper>>()
const options = ref<TWallpaperOptions>({
  animate: false,
  colors: [
    '#90E0EF',
    '#48CAE4',
    '#00B4D8',
    '#0096C7',
    '#0077B6',
    '#023E8A',
  ],
  pattern: {
    mask: false,
    opacity: 0.3,
    image: 'https://twallpaper.js.org/patterns/math.svg',
  },
})
</script>

<template>
  <div v-if="gameState === 'lost'" class="loss-screen fullscreen">
    <div style="display: flex; flex-direction: column; align-items: center; ">
      <div class="text">
        {{ "Ты проиграл" }}
      </div>
      <button class="button" style="margin-top: 50px;" @click="handleRestart">
        Начать заново
      </button>
    </div>
  </div>
  <div v-else-if="gameState === 'won'" class="win-screen fullscreen" style="display: flex; flex-direction: column; align-items: center;">
    <div class="text">
      {{ 'Ты победил' }}
    </div>
    <div class="text" style="font-size: 5vw;">
      {{ `попыток потрачено: ${attempts}` }}
    </div>
  </div>
  <div v-else>
    <div class="centered-container">
      <p style="font-size: 50px; text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4);">
        Игра с коробками
      </p>
      <p style="max-width: 800px; max-height: 25%; font-size: 25px; text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4);">
        Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и яблоки, и апельсины. Однако все коробки подписаны неправильно: на коробке с яблоками не может быть написано "яблоки", на коробке с апельсинами — "апельсины", и на коробке с обоими фруктами — "яблоки и апельсины". Вам можно достать только один фрукт из любой коробки и по нему определить, что находится в остальных коробках.<br><br>
        <b style="color: #992211;">
          Вы можете открыть только одну коробку!
        </b>
      </p>
      <div v-if="game" class="box-container mobile">
        <box
          v-for="(b, index) in game.boxes"
          :key="index"
          :label="b.label"
          :is-open="b.isOpen"
          :content="b.content"
          :took="b.took"
          :prediction="b.prediction"
          :show-prediction="game.firstOpenedIndex !== null && index !== game.firstOpenedIndex"
          :can-change-prediction="canChangePrediction"
          @click="handleBoxClick(index)"
          @prediction-change="handlePredictionChange(index, $event)"
        />
      </div>
      <div v-if="game && game.firstOpenedIndex !== null && game.boxes.filter(b => !b.isOpen).length > 0" class="button-container">
        <button class="button" style="background-color: #023E8A; margin-bottom: 40px;" @click="handleCheck">
          Проверить
        </button>
      </div>
      <TWallpaper
        ref="twallpaper"
        :options="options"
      />
    </div>
    <notification />
  </div>
</template>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media screen and (max-width: 800px) {
  .mobile {
    flex-direction: column;
    gap: 20px;
  }
}

.text {
  font-size: 10vw;
  text-shadow: 0px 1px 16px rgba(0, 0, 0, 0.4);
}

.button{
  display: flex;
  width: 200px;
  justify-content: center;
  border: none;
  color: #fff;
  background-color: #9BC53D;
  border-radius: 8px;
  cursor: pointer;
}

.centered-container {
    user-select: none;
    width: 80%;
    margin: auto;
    margin-top: 10vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.box-container {
    display: flex;
    justify-content: center;
}

.button-container {
    margin-top: 30px;
}
.fullscreen {
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  z-index: 1000;
  animation: fadeIn 1s ease-in;
}
.loss-screen {
  background-color: #404E4D;
  color: #fff;
}
.win-screen {
  background-color: #9BC53D;
  color: #fff;
}
</style>
