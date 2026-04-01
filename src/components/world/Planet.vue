<script setup>
import { TextureLoader } from 'three'
import { ref, shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'
import { useTimeStore } from '../../stores/timeStore'
import { onMounted } from 'vue'
import { MathUtils } from 'three'
import * as THREE from 'three' // Importe THREE pour accéder au Helper
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new THREE.TextureLoader()

// Load the custom Earth model en tâche de fond pour éviter un crash serveur (Suspense)
const earthModelScene = shallowRef(null)
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  '/models/cartoon_earth.glb',
  (gltf) => {
    earthModelScene.value = gltf.scene;
    console.log("Terre 3D chargée avec succès !");
  },
  undefined,
  (error) => {
    console.error("Erreur durant le chargement de cartoon_earth.glb", error);
  }
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
    const distanceToSun = 1496 // 149.6 millions km / 100,000
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
      
      // Vraie distance: 384,400km = 3.84 unités. 
      // Mais avec la Terre gonflée x50 (rayon 3.19), la Lune toucherait la Terre. On multiplie la distance par 10 pour le compromis visuel !
      const distEarthMoon = 38.4
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

 <!-- Échelle : 1 unité = 100 000 km -->
<template>
  <TresGroup ref="AxialTiltRef">
    <TresGroup ref="EarthRef" :position="[0, 0, 0]">
      <!-- Terre personnalisée (modèle GLTF) chargée asynchroneusement -->
      <primitive v-if="earthModelScene" :object="earthModelScene" :scale="[3.19, 3.19, 3.19]" />

      <!-- <primitive :object="new THREE.AxesHelper(5)" /> -->
      <TresMesh ref="MoonRef" :position="[38.4, 0, 0]">
        <!-- Lune : rayon réel 1737km. ×50 = r0.87 -->
        <TresSphereGeometry :args="[0.87, 32, 32]" />
        <TresMeshStandardMaterial :map="moonMap" />
      </TresMesh>
    </TresGroup>
  </TresGroup>

  <TresMesh :position="[0, 0, 0]">
    <!-- Soleil : rayon réel 696,340km. Rendu à l'échelle 1:1 = r6.96 -->
    <TresSphereGeometry :args="[6.96, 64, 64]" />
    <TresMeshStandardMaterial :map="sunMap" :emissive-map="sunEmissionMap" :emissive="0xffffff" :emissive-intensity="100" />
  </TresMesh>

</template>
