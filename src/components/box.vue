<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { ChestEnum } from '../composables/use-game'

interface Props {
  label: ChestEnum
  isOpen: boolean
  content: ChestEnum | null
  prediction: ChestEnum | null
  took: string | null
  showPrediction: boolean
  canChangePrediction: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'click'): void
  (event: 'prediction-change', value: ChestEnum): void
}>()
function onPredictionChangeInternal(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value as ChestEnum
  emit('prediction-change', value)
}

const { label, isOpen, content, prediction, took, showPrediction, canChangePrediction } = toRefs(props)
const localPrediction = ref(prediction.value || '')
watch(prediction, (newVal) => {
  localPrediction.value = newVal || ''
})
const fruitOptions = computed(() => [
  { value: ChestEnum.GOLD, label: ChestEnum.GOLD },
  { value: ChestEnum.SILVER, label: ChestEnum.SILVER },
  { value: ChestEnum.MIXED, label: ChestEnum.MIXED },
])
const chestImageSrc = computed(() => {
  if (label.value === ChestEnum.GOLD) return './chest-gold.webp'
  if (label.value === ChestEnum.SILVER) return './chest-silver.webp'
  if (label.value === ChestEnum.MIXED) return './chest-mixed.webp'
  return ''
})
function handleClick() {
  emit('click')
}
</script>

<template>
  <div class="box-container">
    <div v-if="!isOpen" class="box" @click="handleClick">
      <div style="min-height: 70px; padding-bottom: 20px;">
        <img style="width: 200px;" :src="chestImageSrc" alt="chest">
      </div>
      <transition name="fade">
        <img v-if="!isOpen" style="width: 200px; height: 200px;" src="/chest-closed.webp" alt="chest">
      </transition>
      <div v-if="showPrediction">
        <select v-model="localPrediction" style="border: 0; background-color: rgba(255, 255, 255, 0.4); padding: 10px; font-size: 15px;" :disabled="!canChangePrediction" @click.stop @change="onPredictionChangeInternal">
          <option value="">
            Выберите содержимое
          </option>
          <option v-for="option in fruitOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div v-else class="box">
      <div style="min-height: 70px; padding-bottom: 20px;">
        <img style="width: 200px;" :src="chestImageSrc" alt="chest">
      </div>
      <transition>
        <img v-if="isOpen" style="width: 200px; height: 200px;" src="/chest-opened.webp" alt="chest">
      </transition>
      <div v-if="took">
        <div class="text">
          Вы достали: <b>{{ took }}</b>
        </div>
      </div>
      <div v-else>
        <p>Содержимое: <b>{{ content }}</b></p>
      </div>
      <div v-if="showPrediction && prediction">
        <p>Ваш выбор: <b>{{ prediction }}</b></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text {
  margin-top: 20px;
  font-size: 20px;
}
.box-container {
  margin: 10px;
  padding: 10px;
  text-align: center;
  width: 250px;
}
.box {
  padding: 20px;
  cursor: pointer;
}
</style>
