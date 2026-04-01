<script setup>
import { useTimeStore } from './stores/timeStore'
import SpaceScene from './components/SpaceScene.vue'
import ObjectDetails from './components/ui/ObjectDetails.vue'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'

const timeStore = useTimeStore()
</script>

<template>
  <SpaceScene />
  <ObjectDetails />
  <LoadingOverlay />
</template>
