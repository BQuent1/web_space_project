<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { Stars, OrbitControls } from '@tresjs/cientos'
import SolarSystem from './world/SolarSystem.vue'
import { useTimeStore } from '@/stores/timeStore'
import TimeControls from './ui/TimeControls.vue'

</script>

<template>

  <div class="space-scene">
    <TresCanvas window-size>
      <TresPerspectiveCamera ref="cameraRef" :position="[40, 20, 40]"
        :look-at="[useTimeStore().earthPosition.x, useTimeStore().earthPosition.y, useTimeStore().earthPosition.z]"
        :fov="45" name="main-camera" :make-default="true" />

      <OrbitControls
        :target="[useTimeStore().earthPosition.x, useTimeStore().earthPosition.y, useTimeStore().earthPosition.z]" />

      <Suspense>
        <SolarSystem />
      </Suspense>

      <Stars :radius="300" :depth="60" :count="20000" />

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
