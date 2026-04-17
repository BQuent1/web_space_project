<script setup>
import { TextureLoader } from 'three'
import { ref, shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'
import { useTimeStore } from '../../stores/timeStore'
import { onMounted } from 'vue'
import { MathUtils } from 'three'
import * as THREE from 'three' // import pour le helper
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new THREE.TextureLoader()

// Load the custom Earth model en tâche de fond
const earthModelScene = shallowRef(null)
const moonModelScene = shallowRef(null)
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
gltfLoader.load(
  '/models/moon.glb',
  (gltf) => {
    moonModelScene.value = gltf.scene;
    console.log("Lune 3D chargée avec succès !");
  },
  undefined,
  (error) => {
    console.error("Erreur durant le chargement de moon.glb", error);
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

const timeStore = useTimeStore()
const EarthRef = ref()
const AxialTiltRef = ref()
const MoonRef = ref()
defineExpose({ EarthRef })


const { onBeforeRender } = useLoop()

// rotation légère statique de la terre sur l'axe
onMounted(() => {
  if (AxialTiltRef.value) {
      // on incline l'axe
      AxialTiltRef.value.rotation.z = -(23.5 * Math.PI) / 180
    }
})

// 1million de km = 1 unité 
onBeforeRender(({ delta }) => {
  if (EarthRef.value && AxialTiltRef.value) {
    const date = timeStore.currentDate
    
    const distanceToSun = 1496 // 149.6 millions km / 100,000
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const diffInMs = date.getTime() - startOfYear.getTime()
    const dayOfYear = diffInMs / (1000 * 60 * 60 * 24)
    const orbitAngle = (dayOfYear / 365.25) * Math.PI * 2

    const targetX = Math.cos(orbitAngle) * distanceToSun
    const targetZ = Math.sin(orbitAngle) * distanceToSun

    const smoothing = MathUtils.clamp(delta * 10, 0, 1)
    AxialTiltRef.value.position.x = MathUtils.lerp(AxialTiltRef.value.position.x, targetX, smoothing)
    AxialTiltRef.value.position.z = MathUtils.lerp(AxialTiltRef.value.position.z, targetZ, smoothing)

    const secondsUTC = (date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + date.getUTCSeconds()
    

    const rotationOffset = Math.PI / 2 + (23.5 * Math.PI) / 180
    EarthRef.value.rotation.y = (secondsUTC / 86400) * Math.PI * 2 + Math.PI + rotationOffset

    if (MoonRef.value) {
      const lastNewMoon = new Date('2026-01-19T10:00:00Z').getTime()
      const msSinceNewMoon = date.getTime() - lastNewMoon
      const lunarCycleMs = 29.53059 * 24 * 60 * 60 * 1000
      const lunarPhaseAngle = (msSinceNewMoon / lunarCycleMs) * Math.PI * 2
      
      // Vraie distance: 384,400km = 3.84 unités. 
      const distEarthMoon = 38.4
      MoonRef.value.position.x = Math.cos(lunarPhaseAngle) * distEarthMoon
      MoonRef.value.position.z = Math.sin(lunarPhaseAngle) * distEarthMoon
      
      MoonRef.value.rotation.y = lunarPhaseAngle + Math.PI
    }

    timeStore.updateEarthPosition(
      AxialTiltRef.value.position.x,
      AxialTiltRef.value.position.y,
      AxialTiltRef.value.position.z
    )
  }
})
</script>

 <!-- 1 unité = 100 000 km -->
<template>
  <TresGroup ref="AxialTiltRef">
    <TresGroup ref="EarthRef" :position="[0, 0, 0]">
      <!-- modèles terre et lune -->
      <primitive v-if="earthModelScene" :object="earthModelScene" :scale="[3.19, 3.19, 3.19]" />
    </TresGroup>
    <TresGroup ref="MoonRef" :position="[38.4, 0, 0]">
      <primitive v-if="moonModelScene" :object="moonModelScene" :scale="[0.47, 0.47, 0.47]" />
    </TresGroup>
  </TresGroup>

  <TresMesh :position="[0, 0, 0]">
    <TresSphereGeometry :args="[6.96, 64, 64]" />
    <TresMeshStandardMaterial :map="sunMap" :emissive-map="sunEmissionMap" :emissive="0xffffff" :emissive-intensity="100" />
  </TresMesh>

</template>
