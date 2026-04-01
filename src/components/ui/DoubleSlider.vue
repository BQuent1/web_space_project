<script setup>
const props = defineProps({
  min: Number,
  max: Number,
  step: Number,
  modelValue: Object, // { min: 0, max: 100 }
  label: String,
  unit: String
})

const emit = defineEmits(['update:modelValue'])

const updateMin = (e) => {
  const newMin = Number(e.target.value)
  if (newMin < props.modelValue.max) {
    emit('update:modelValue', { min: newMin, max: props.modelValue.max })
  } else {
    e.target.value = props.modelValue.min
  }
}

const updateMax = (e) => {
  const newMax = Number(e.target.value)
  if (newMax > props.modelValue.min) {
    emit('update:modelValue', { min: props.modelValue.min, max: newMax })
  } else {
    e.target.value = props.modelValue.max
  }
}
</script>

<template>
  <div class="slider-container">
    <div class="header">
      <span class="label">{{ label }}</span>
      <span class="values">{{ modelValue.min.toLocaleString() }} - {{ modelValue.max.toLocaleString() }} {{ unit }}</span>
    </div>
    <div class="range-slider">
      <div class="track"></div>
      <div class="progress" :style="{ left: ((modelValue.min - min)/(max - min)*100) + '%', right: (100 - (modelValue.max - min)/(max - min)*100) + '%' }"></div>
      <input type="range" :min="min" :max="max" :step="step" :value="modelValue.min" @input="updateMin" class="thumb" />
      <input type="range" :min="min" :max="max" :step="step" :value="modelValue.max" @input="updateMax" class="thumb" />
    </div>
  </div>
</template>

<style scoped>
.slider-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
}
.label { font-weight: bold; color: #333; }
.values { color: #555; font-family: monospace; font-weight: bold; }
.range-slider {
  position: relative;
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
}
.progress {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #2b78e4;
  border-radius: 3px;
  z-index: 1;
}
.thumb {
  position: absolute;
  top: -6px;
  width: 100%;
  pointer-events: none;
  appearance: none;
  background: none;
  margin: 0;
  z-index: 2;
}
.thumb::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #2b78e4;
  cursor: grab;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.thumb::-moz-range-thumb {
  pointer-events: auto;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #2b78e4;
  cursor: grab;
}
</style>
