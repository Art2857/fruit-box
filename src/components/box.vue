<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { BoxEnum } from '../composables/use-game'

interface Props {
  label: BoxEnum
  isOpen: boolean
  content: BoxEnum | null
  prediction: BoxEnum | null
  took: string | null
  showPrediction: boolean
  canChangePrediction: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'click'): void
  (event: 'prediction-change', value: BoxEnum): void
}>()
function onPredictionChangeInternal(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target.value as BoxEnum
  emit('prediction-change', value)
}

const { label, isOpen, content, prediction, took, showPrediction, canChangePrediction } = toRefs(props)
const localPrediction = ref(prediction.value || '')
watch(prediction, (newVal) => {
  localPrediction.value = newVal || ''
})
const fruitOptions = computed(() => [
  { value: BoxEnum.APPLE, label: BoxEnum.APPLE },
  { value: BoxEnum.ORANGE, label: BoxEnum.ORANGE },
  { value: BoxEnum.MIXED, label: BoxEnum.MIXED },
])
const boxImageSrc = computed(() => {
  if (label.value === BoxEnum.APPLE) return './frame-apple.webp'
  if (label.value === BoxEnum.ORANGE) return './frame-orange.webp'
  if (label.value === BoxEnum.MIXED) return './frame-mixed.webp'
  return ''
})
function handleClick() {
  emit('click')
}
</script>

<template>
  <div class="box-container" style="user-select: none;">
    <div v-if="!isOpen" class="box" @click="handleClick">
      <div style="min-height: 70px; padding-bottom: 20px;">
        <img style="width: 200px;" :src="boxImageSrc" alt="box">
      </div>
      <transition name="fade">
        <img v-if="!isOpen" style="width: 200px; height: 200px;" src="/box-closed.webp" alt="box">
      </transition>
      <div v-if="showPrediction">
        <select v-model="localPrediction" style="border: 0; background-color: rgba(255, 255, 255, 0.4); padding: 10px; font-size: 13px;" :disabled="!canChangePrediction" @click.stop @change="onPredictionChangeInternal">
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
        <img style="width: 200px;" :src="boxImageSrc" alt="box">
      </div>
      <transition>
        <img v-if="isOpen" style="width: 200px; height: 200px;" src="/box-opened.webp" alt="box">
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
