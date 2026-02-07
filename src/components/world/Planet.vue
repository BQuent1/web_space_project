<script setup>
import { TextureLoader } from 'three'
import { ref } from 'vue'
// import { useFrame } from '@tresjs/core'
import { useLoop } from '@tresjs/core'
import { useTimeStore } from '../../stores/timeStore'


const loader = new TextureLoader()

const mapUrl = '/textures/2k_earth_daymap.jpg'
const normalMapUrl = '/textures/2k_earth_normal_map.jpg'
const emissionMapUrl = '/textures/2k_earth_nightmap.jpg'

const map = loader.load(
  mapUrl,
  (tex) => console.warn('Texture chargée avec succès !'),
  undefined,
  (err) => console.error('Erreur de chargement texture :', err)
)
const normalMap = loader.load(
  normalMapUrl,
  (tex) => console.warn('Texture normale chargée avec succès !'),
  undefined,
  (err) => console.error('Erreur de chargement texture :', err)
)
const emissionMap = loader.load(
  emissionMapUrl,
  (tex) => console.warn('Texture émissive chargée avec succès !'),
  undefined,
  (err) => console.error('Erreur de chargement texture :', err)
)

const timeStore = useTimeStore()
const EarthRef = ref()

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  if (EarthRef.value) {
    const date = timeStore.currentDate
    const seconds = (date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + date.getUTCSeconds()

    const rotationY = (seconds / 86400) * Math.PI * 2 + Math.PI

    EarthRef.value.rotation.y = rotationY
  }
})

// onMounted(() => {
//   if (EarthRef.value) {
//     EarthRef.value.rotation.z = (23.5 * Math.PI) / 180
//   }
// })


</script>

<template>
  <TresMesh ref="EarthRef">
    <TresSphereGeometry :args="[2, 64, 64]" />
    <TresMeshStandardMaterial :map="map" :normal-map="normalMap" :emissive-map="emissionMap" :emissive="0xffffff" :emissive-intensity="2"/>
  </TresMesh>
</template>
