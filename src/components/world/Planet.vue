<script setup>
import { TextureLoader } from 'three'
import { ref } from 'vue'
import { useLoop } from '@tresjs/core'
import { useTimeStore } from '../../stores/timeStore'
import { onMounted } from 'vue'
import { MathUtils } from 'three'
import * as THREE from 'three' // Importe THREE pour accéder au Helper

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

// moon texture
const moonMapUrl = '/textures/2k_moon.jpg'
const moonMap = loader.load(
  moonMapUrl,
  (tex) => console.warn('Texture de la lune chargée avec succès !'),
  undefined,
  (err) => console.error('Erreur de chargement texture :', err)
)

const timeStore = useTimeStore()
const EarthRef = ref()
const AxialTiltRef = ref()
const MoonRef = ref()
defineExpose({ EarthRef })


const { onBeforeRender } = useLoop()

// rotation légère statique de la terre sur l'axe
onMounted(() => {
  if (AxialTiltRef.value) {
      // On incline l'AXE une bonne fois pour toutes
      // L'inclinaison est constante par rapport aux étoiles
      AxialTiltRef.value.rotation.z = -(23.5 * Math.PI) / 180
    }
})

// 1million de km = 1 unité 
onBeforeRender(({ delta }) => {
  if (EarthRef.value && AxialTiltRef.value) {
    const date = timeStore.currentDate
    
    // 1. CALCUL DE L'ORBITE (Position de la Terre autour du Soleil)
    const distanceToSun = 150
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const diffInMs = date.getTime() - startOfYear.getTime()
    const dayOfYear = diffInMs / (1000 * 60 * 60 * 24)
    const orbitAngle = (dayOfYear / 365.25) * Math.PI * 2

    // Position théorique sur le cercle
    const targetX = Math.cos(orbitAngle) * distanceToSun
    const targetZ = Math.sin(orbitAngle) * distanceToSun

    // Lissage du mouvement pour éviter les saccades en vitesse rapide
    const smoothing = MathUtils.clamp(delta * 10, 0, 1)
    AxialTiltRef.value.position.x = MathUtils.lerp(AxialTiltRef.value.position.x, targetX, smoothing)
    AxialTiltRef.value.position.z = MathUtils.lerp(AxialTiltRef.value.position.z, targetZ, smoothing)

    // 2. ROTATION DE LA TERRE (Heure locale / Greenwich)
    const secondsUTC = (date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + date.getUTCSeconds()
    
    // - On utilise le signe "-" car la Terre tourne d'Ouest en Est
    // - On ajoute Math.PI pour que 00:00 UTC soit à l'opposé du Soleil (Minuit)
    // - On ajoute Math.PI / 2 pour recaler le centre de ta texture (0° Longitude) face au Z
    const rotationOffset = Math.PI / 2 + (23.5 * Math.PI) / 180
    EarthRef.value.rotation.y = (secondsUTC / 86400) * Math.PI * 2 + Math.PI + rotationOffset

    // 3. POSITION DE LA LUNE (Phase réelle)
    if (MoonRef.value) {
      // Référence : Nouvelle lune réelle du 19 Janvier 2026
      const lastNewMoon = new Date('2026-01-19T10:00:00Z').getTime()
      const msSinceNewMoon = date.getTime() - lastNewMoon
      const lunarCycleMs = 29.53059 * 24 * 60 * 60 * 1000
      const lunarPhaseAngle = (msSinceNewMoon / lunarCycleMs) * Math.PI * 2
      
      const distEarthMoon = 8
      MoonRef.value.position.x = Math.cos(lunarPhaseAngle) * distEarthMoon
      MoonRef.value.position.z = Math.sin(lunarPhaseAngle) * distEarthMoon
      
      // La lune présente toujours la même face à la terre (verrouillage gravitationnel)
      MoonRef.value.rotation.y = lunarPhaseAngle + Math.PI
    }

    // 4. MISE À JOUR DU STORE (Pour la caméra et les astéroïdes)
    timeStore.updateEarthPosition(
      AxialTiltRef.value.position.x,
      AxialTiltRef.value.position.y,
      AxialTiltRef.value.position.z
    )
  }
})
</script>

 <!-- 1 unité = 1 million de km -->
<template>
  <TresGroup ref="AxialTiltRef">
    <TresMesh ref="EarthRef" :position="[0, 0, 0]">
      <TresSphereGeometry :args="[2, 64, 64]" />
      <TresMeshStandardMaterial :map="map" :normal-map="normalMap" :emissive-map="emissionMap" :emissive="0xffffff" :emissive-intensity="2"/>

      <!-- <primitive :object="new THREE.AxesHelper(5)" /> -->
      <TresMesh ref="MoonRef" :position="[3.8, 0, 0]">
        <TresSphereGeometry :args="[0.5, 32, 32]" />
        <TresMeshStandardMaterial :map="moonMap" />
      </TresMesh>
    </TresMesh>
  </TresGroup>

  <TresMesh :position="[0, 0, 0]">
    <TresSphereGeometry :args="[5, 64, 64]" />
    <TresMeshStandardMaterial :map="sunMap" :emissive-map="sunEmissionMap" :emissive="0xffffff" :emissive-intensity="5" />
  </TresMesh>

</template>
