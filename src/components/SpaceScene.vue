<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'
import Planet from './world/Planet.vue'
import Asteroid from './world/Asteroid.vue'

defineProps({
  asteroids: Array
})
</script>

<template>
  <TresCanvas window-size>
    <TresPerspectiveCamera :position="[0, 15, 30]" />
    <OrbitControls />

    <!-- <TresAmbientLight :intensity="1" /> -->
    <TresDirectionalLight :position="[10, 10, 10]" :intensity="2" />

    <Suspense>
      <Planet />
    </Suspense>

    <Asteroid
      v-for="(astro, index) in asteroids"
      :key="astro.id"
      :data="astro"
      :index="index"
    />

    <Stars />
  </TresCanvas>
</template>
