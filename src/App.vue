<script setup>
import { ref } from 'vue'
import { useTimeStore } from './stores/timeStore'
import SpaceScene from './components/SpaceScene.vue'
import ObjectDetails from './components/ui/ObjectDetails.vue'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import LandingPage from './components/ui/LandingPage.vue'

const timeStore = useTimeStore()
const hasStarted = ref(false)
</script>

<template>
  <Transition name="fade">
    <LandingPage v-if="!hasStarted" @start="hasStarted = true" />
  </Transition>
  
  <div v-if="hasStarted" class="app-content fade-in">
    <SpaceScene />
    <ObjectDetails />
    <LoadingOverlay />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-content {
  width: 100%;
  height: 100vh;
  position: relative;
}

.fade-in {
  animation: appFadeIn 1s ease-out forwards;
}

@keyframes appFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
