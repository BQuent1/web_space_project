<script setup>
import { onMounted, ref } from 'vue'
import { nasaService } from './services/nasaApi.js'
import SpaceScene from './components/SpaceScene.vue'

const asteroidsList = ref([]) // Le tableau vide au début

onMounted(async () => {
  asteroidsList.value = await nasaService.getAsteroids()
  console.log("Données chargées dans App.vue", asteroidsList.value)
})
</script>

<template>
  <SpaceScene :asteroids="asteroidsList" />
</template>