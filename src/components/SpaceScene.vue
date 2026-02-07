<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { Stars, OrbitControls } from '@tresjs/cientos'
import SolarSystem from './world/SolarSystem.vue'

</script>

<template>
  <TresCanvas window-size>
    <TresPerspectiveCamera :position="[0, 5, 10]" />
    <OrbitControls />

    <SolarSystem />

    <Stars />
  </TresCanvas>
</template>
