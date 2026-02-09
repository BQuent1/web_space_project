<script setup>
import { TextureLoader } from 'three'
import { ref } from 'vue'
import { useLoop } from '@tresjs/core'
import { useTimeStore } from '../../stores/timeStore'
import { onMounted } from 'vue'


const loader = new TextureLoader()

// earth textures
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

// sun texture
const sunMapUrl = '/textures/2k_sun.jpg'
const sunEmissionMapUrl = '/textures/2k_sun.jpg'

const sunMap = loader.load(
  sunMapUrl,
  (tex) => console.warn('Texture du soleil chargée avec succès !'),
  undefined,
  (err) => console.error('Erreur de chargement texture :', err)
)

const sunEmissionMap = loader.load(
  sunEmissionMapUrl,
  (tex) => console.warn('Texture émissive du soleil chargée avec succès !'),
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

onMounted(() => {
  if (EarthRef.value) {
    EarthRef.value.rotation.z = (23.5 * Math.PI) / 180
  }
})

</script>

<template>
  <TresMesh ref="EarthRef">
    <TresSphereGeometry :args="[2, 64, 64]" />
    <TresMeshStandardMaterial :map="map" :normal-map="normalMap" :emissive-map="emissionMap" :emissive="0xffffff" :emissive-intensity="2"/>
  </TresMesh>

  <TresMesh :position="[0, 0, -10]">
    <TresSphereGeometry :args="[5, 64, 64]" />
    <TresMeshStandardMaterial :map="sunMap" :emissive-map="sunEmissionMap" :emissive="0xffffff" :emissive-intensity="2" />
  </TresMesh>

</template>
