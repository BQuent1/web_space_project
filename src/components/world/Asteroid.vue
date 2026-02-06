<script setup>
import { computed } from 'vue'

const props = defineProps({
  position: Object,
  size: Number,
  data: Object,
  index: Number,
})

const position = computed(() => {
  const distance = 10 + (props.index * 1.5)
  const angle = props.index * 0.8
  return [
    Math.cos(angle) * distance,
    (Math.random() - 0.5) * 5,
    Math.sin(angle) * distance,
  ]
})

const scale = computed(() => {
  const s = props.data.size / 100
  return Math.max(0.2, Math.min(s, 1.5))
})
</script>

<template>
  <TresMesh :position="position" :scale="scale">
    <TresDodecahedronGeometry :args="[1, 0]" />
    <TresMeshToonMaterial :color="data.isDangerous ? '#ff6600' : '#888888'" />
  </TresMesh>
</template>
