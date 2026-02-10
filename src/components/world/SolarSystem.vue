<script setup>
import { useLoop, useTresContext } from '@tresjs/core'
import { useTimeStore } from '@/stores/timeStore'
import { ref } from 'vue'
import Planet from './Planet.vue'
import { watchEffect } from 'vue';


const timeStore = useTimeStore()
const targetRef = ref()
const { camera } = useTresContext()

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  timeStore.tick(delta)

  if (targetRef.value) {
    targetRef.value.position.set(
      timeStore.earthPosition.x,
      timeStore.earthPosition.y,
      timeStore.earthPosition.z
    )
  }

})

</script>

<template>
  <Suspense>
    <Planet />
  </Suspense>

  <TresGroup ref="targetRef" />

  <TresDirectionalLight 
    :position="[0, 0, 0]" 
    :target="targetRef" 
    :intensity="5" 
  />
  <TresAmbientLight :intensity="0.2" />
</template>