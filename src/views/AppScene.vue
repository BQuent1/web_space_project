<script setup>
import SpaceScene from '../components/SpaceScene.vue'
import ObjectDetails from '../components/ui/ObjectDetails.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
</script>

<template>
  <div class="app-content fade-in">
    <SpaceScene />
    <ObjectDetails />
    <LoadingOverlay />
  </div>
</template>

<style scoped>
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
