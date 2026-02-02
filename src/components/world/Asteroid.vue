<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Object,
  index: Number
})

const position = computed(() => {
  const distance = 10 + (props.index * 1.5) // Ils s'étalent de 10 à 30 unités
  const angle = props.index * 0.8 // Rotation autour de la Terre
  return [
    Math.cos(angle) * distance,
    (Math.random() - 0.5) * 5, // Un peu de variation en hauteur (Y)
    Math.sin(angle) * distance
  ]
})

const scale = computed(() => {
  const s = props.data.size / 100 // On réduit l'échelle
  return Math.max(0.2, Math.min(s, 1.5)) // Taille mini 0.2, maxi 1.5
})
</script>

<template>
  <TresMesh :position="position" :scale="scale">
    <TresDodecahedronGeometry :args="[1, 0]" />
    <TresMeshToonMaterial :color="data.isDangerous ? '#ff6600' : '#888888'" />
  </TresMesh>
</template>
