<script setup>
import { onMounted, ref, watch } from 'vue'
import { useTimeStore } from './stores/timeStore'
import { nasaService } from './services/nasaApi.js'
import SpaceScene from './components/SpaceScene.vue'
import ObjectDetails from './components/ui/ObjectDetails.vue'

const asteroidsList = ref([])
const timeStore = useTimeStore()

// Variable pour conserver le jour local actuellement chargé
let loadedDayString = '';

const getLocalDayString = (d) => {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

onMounted(async () => {
  loadedDayString = getLocalDayString(timeStore.currentDate);
  asteroidsList.value = await nasaService.getAsteroids(timeStore.currentDate)
  console.log(`Données chargées pour le ${loadedDayString}`, asteroidsList.value)
})

watch(() => timeStore.currentDate, async (newDate) => {
  const newDayString = getLocalDayString(newDate);
  // Si le jour local a changé, on déclenche un nouveau chargement
  if (newDayString !== loadedDayString) {
    loadedDayString = newDayString;
    console.log(`Changement de jour local détecté : Chargement des astéroïdes pour le ${loadedDayString}`);
    asteroidsList.value = await nasaService.getAsteroids(newDate);
  }
})
</script>

<template>
  <SpaceScene :asteroids="asteroidsList" />
  <ObjectDetails />
</template>
