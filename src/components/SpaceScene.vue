<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { Stars, OrbitControls } from '@tresjs/cientos'
import SolarSystem from './world/SolarSystem.vue'
import { useTimeStore } from '@/stores/timeStore'
import TimeControls from './ui/TimeControls.vue'
import { ref, watch } from 'vue'
import { getAsteroidTresPosition } from '@/utils/ephemerisUtils'

const timeStore = useTimeStore()
const cameraRef = ref()
const orbitTarget = ref([150, 0, 0])

let initialized = false;
let lastFocusPos = { x: 0, y: 0, z: 0 };
let lastSelectedAsteroidId: string | null = null;

watch(() => timeStore.earthPosition, (earthPos) => {
  let targetFocusPos = { x: earthPos.x, y: earthPos.y, z: earthPos.z };
  let isAsteroidFocused = false;
  
  if (timeStore.selectedAsteroid) {
    const localPos = getAsteroidTresPosition(timeStore.selectedAsteroid.ephemeris, timeStore.currentDate.getTime());
    if (localPos) {
      targetFocusPos.x += localPos.x;
      targetFocusPos.y += localPos.y;
      targetFocusPos.z += localPos.z;
      isAsteroidFocused = true;
    }
  }

  // Handle switching targets (Camera Jump)
  const currentAsteroidId = timeStore.selectedAsteroid ? timeStore.selectedAsteroid.id : null;
  if (initialized && cameraRef.value && currentAsteroidId !== lastSelectedAsteroidId) {
    if (isAsteroidFocused) {
      // Zoom close to the asteroid
      cameraRef.value.position.set(targetFocusPos.x + 0.5, targetFocusPos.y + 0.3, targetFocusPos.z + 0.5);
    } else {
      // Zoom back to Earth
      cameraRef.value.position.set(targetFocusPos.x + 40, targetFocusPos.y + 20, targetFocusPos.z + 40);
    }
    orbitTarget.value = [targetFocusPos.x, targetFocusPos.y, targetFocusPos.z];
    lastFocusPos = { ...targetFocusPos };
    lastSelectedAsteroidId = currentAsteroidId;
    return; // Skip delta movement for this frame
  }

  // Regular tracking
  if (!initialized && targetFocusPos.x !== 150 && cameraRef.value) { 
    // Initialisation
    cameraRef.value.position.set(targetFocusPos.x + 40, targetFocusPos.y + 20, targetFocusPos.z + 40)
    orbitTarget.value = [targetFocusPos.x, targetFocusPos.y, targetFocusPos.z]
    
    lastFocusPos = { ...targetFocusPos }
    initialized = true
    lastSelectedAsteroidId = currentAsteroidId;
  } else if (initialized && cameraRef.value) {
    const dx = targetFocusPos.x - lastFocusPos.x;
    const dy = targetFocusPos.y - lastFocusPos.y;
    const dz = targetFocusPos.z - lastFocusPos.z;

    if (dx !== 0 || dy !== 0 || dz !== 0) {
      cameraRef.value.position.x += dx;
      cameraRef.value.position.y += dy;
      cameraRef.value.position.z += dz;
      
      orbitTarget.value = [targetFocusPos.x, targetFocusPos.y, targetFocusPos.z]
      
      lastFocusPos = { ...targetFocusPos }
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
