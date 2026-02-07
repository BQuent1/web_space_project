<script setup>
import { useLoop } from '@tresjs/core'
import { useTimeStore } from '@/stores/timeStore'
import Planet from './Planet.vue'

const timeStore = useTimeStore()

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  timeStore.tick(delta)
})
</script>

<template>
  <Planet />
  <TresDirectionalLight :position="[0, 0, 50]" :intensity="2" />
  <!-- <TresAmbientLight :intensity="0.5" /> -->
</template>
