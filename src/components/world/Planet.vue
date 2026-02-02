<script setup>
import { TextureLoader } from 'three'
import { ref } from 'vue'

// On crée le chargeur
const loader = new TextureLoader()

// On charge la texture (le chargement se fait en arrière-plan)
// Utilise cette URL de test qui est très permissive :
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
</script>

<template>
  <TresMesh>
    <TresSphereGeometry :args="[2, 64, 64]" />
    <TresMeshStandardMaterial :map="map" :normal-map="normalMap" :emissive-map="emissionMap" :emissive="0xffffff" :emissive-intensity="2"/>
  </TresMesh>
</template>
