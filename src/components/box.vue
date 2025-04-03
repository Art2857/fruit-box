<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { BOX_TYPES } from '../composables/use-game'
import type { BoxType } from '../composables/use-game'

interface Props {
  label: BoxType
  isOpen: boolean
  content: BoxType | null
  prediction: BoxType | null
  took: string | null
  showPrediction: boolean
  canChangePrediction: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'click'): void
  (event: 'prediction-change', value: BoxType): void
}>()

function onPredictionChangeInternal(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('prediction-change', target.value as BoxType)
}

const { label, isOpen, prediction, took, showPrediction, canChangePrediction } = toRefs(props)
const localPrediction = ref(prediction.value || '')
watch(prediction, (newVal) => {
  localPrediction.value = newVal || ''
})

const fruitOptions = computed(() => [
  { value: BOX_TYPES.APPLE, label: BOX_TYPES.APPLE },
  { value: BOX_TYPES.ORANGE, label: BOX_TYPES.ORANGE },
  { value: BOX_TYPES.MIXED, label: BOX_TYPES.MIXED },
])

const boxImageSrc = computed(() => {
  return {
    [BOX_TYPES.APPLE]: './frame-apple.webp',
    [BOX_TYPES.ORANGE]: './frame-orange.webp',
    [BOX_TYPES.MIXED]: './frame-mixed.webp',
  }[label.value] || ''
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <div class="box-container" style="user-select: none;">
    <div v-if="!isOpen" class="box" @click="handleClick">
      <div style="min-height: clamp(80px, 10vh, 90px); padding-bottom: 20px;">
        <img style="width: clamp(160px, 25vw, 180px);" :src="boxImageSrc" alt="box-frame">
      </div>
      <transition name="fade">
        <img v-if="!isOpen" style="width: clamp(180px, 28vw, 200px); height: clamp(180px, 28vw, 200px);" src="/box-closed.webp" alt="box-closed">
      </transition>
      <div style="min-height: 50px; display: flex; justify-content: center; align-items: center;">
        <select
          v-model="localPrediction"
          class="hidden"
          :class="{ visible: showPrediction }"
          style="border: 0; background-color: rgba(255, 255, 255, 0.4); padding: 12px; font-size: clamp(1rem, 1vw, 1rem)"
          :disabled="!canChangePrediction"
          @click.stop
          @change="onPredictionChangeInternal"
        >
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
      <div style="min-height: clamp(80px, 10vh, 90px); padding-bottom: 20px;">
        <img style="width: clamp(160px, 25vw, 180px);" :src="boxImageSrc" alt="box-frame">
      </div>
      <transition>
        <img v-if="isOpen" style="width: clamp(180px, 28vw, 200px); height: clamp(180px, 28vw, 200px);" src="/box-opened.webp" alt="box-opened">
      </transition>
      <div>
        <div class="text taken" :class="{ visible: took }">
          Вы достали: <b>{{ took }}</b>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden { visibility: hidden; opacity: 0; transition: opacity 0.2s ease, visibility 0.2s; }
.hidden.visible { visibility: visible; opacity: 1; }
.text { margin-top: 20px; font-size: clamp(1rem, 2vw, 1.2rem); }
.box-container { margin: 12px; padding: 12px; text-align: center; width: clamp(280px, 30vw, 300px); }
.box { padding-left: clamp(30px, 5vw, 40px); padding-right: clamp(30px, 5vw, 40px); cursor: pointer; }
</style>
