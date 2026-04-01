<script setup>
import { useLoop, useTresContext } from '@tresjs/core'
import { useTimeStore } from '@/stores/timeStore'
import { ref, computed } from 'vue'
import Planet from './Planet.vue'
import Asteroid from './Asteroid.vue'
import { watchEffect } from 'vue'

const timeStore = useTimeStore()
const targetRef = ref()
const { camera } = useTresContext()

const filteredAsteroids = computed(() => {
  const f = timeStore.filters;
  return timeStore.asteroids.filter(a => {
    if (f.showDangerousOnly && !a.isDangerous) return false;
    
    if (a.size < f.minDiameter || a.size > f.maxDiameter) return false;
    
    const speed = parseFloat(a.velocity);
    if (speed < f.minSpeed || speed > f.maxSpeed) return false;
    
    const distM = parseFloat(a.distance) / 1000000;
    if (distM < f.minDistance || distM > f.maxDistance) return false;

    return true;
  });
})

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

const onAsteroidClick = (asteroidData) => {
  console.log('Clicked on Asteroid:', asteroidData)
  timeStore.setSelectedAsteroid(asteroidData)
}
</script>

<template>
  <Suspense>
    <Planet />
  </Suspense>

  <TresGroup ref="targetRef" />

  <Asteroid 
    v-for="(asteroid, index) in filteredAsteroids" 
    :key="asteroid.id"
    :data="asteroid"
    :index="index"
    @click="onAsteroidClick"
  />

  <TresDirectionalLight 
    :position="[0, 0, 0]" 
    :target="targetRef" 
    :intensity="5" 
  />
  <TresAmbientLight :intensity="0.2" />
</template>