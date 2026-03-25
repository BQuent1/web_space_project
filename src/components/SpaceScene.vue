<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { Stars, OrbitControls } from '@tresjs/cientos'
import SolarSystem from './world/SolarSystem.vue'
import { useTimeStore } from '@/stores/timeStore'
import TimeControls from './ui/TimeControls.vue'
import { ref, watch } from 'vue'

const timeStore = useTimeStore()
const cameraRef = ref()
const orbitTarget = ref([150, 0, 0])

let initialized = false;
let lastEarthPos = { x: 0, y: 0, z: 0 };

watch(() => timeStore.earthPosition, (earthPos) => {
  if (!initialized && earthPos.x !== 150 && cameraRef.value) { 
    // Initialisation : on place la caméra proche de la Terre
    cameraRef.value.position.set(earthPos.x + 40, earthPos.y + 20, earthPos.z + 40)
    orbitTarget.value = [earthPos.x, earthPos.y, earthPos.z]
    
    lastEarthPos = { ...earthPos }
    initialized = true
  } else if (initialized && cameraRef.value) {
    // Déplacement de la caméra : on translate du même vecteur que la Terre
    const dx = earthPos.x - lastEarthPos.x;
    const dy = earthPos.y - lastEarthPos.y;
    const dz = earthPos.z - lastEarthPos.z;

    if (dx !== 0 || dy !== 0 || dz !== 0) {
      cameraRef.value.position.x += dx;
      cameraRef.value.position.y += dy;
      cameraRef.value.position.z += dz;
      
      orbitTarget.value = [earthPos.x, earthPos.y, earthPos.z]
      
      lastEarthPos = { ...earthPos }
    }
  }
}, { deep: true, flush: 'sync' })
</script>

<template>

  <div class="space-scene">
    <TresCanvas window-size>
      <TresPerspectiveCamera ref="cameraRef" 
        :fov="45" :far="10000" name="main-camera" :make-default="true" />

      <OrbitControls :target="orbitTarget" />

      <Suspense>
        <SolarSystem />
      </Suspense>

      <Stars :radius="3000" :depth="600" :count="20000" />

    </TresCanvas>
    <TimeControls class="ui-layer" />

  </div>

</template>

<style>
space-scene {
  position: relative;
  width: 100%;
  height: 100vh;
}

.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
}
</style>
