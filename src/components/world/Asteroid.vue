<script setup>
import { computed, ref } from 'vue'
import { useTimeStore } from '@/stores/timeStore'

const props = defineProps({
  position: Object, // passed but now dynamically computed
  size: Number,
  data: Object,
  index: Number,
})

const timeStore = useTimeStore()
const MAX_VISIBLE_DISTANCE_KM = 15000000 // 15 million km
const SCALE_UNIT = 100000 // 1 unit = 100k km

// Local coordinate calculation
const positionValues = computed(() => {
  const ephemeris = props.data.ephemeris;
  if (!ephemeris || ephemeris.length === 0) {
    return { localPos: [0, 0, 0], isVisible: false };
  }

  const currentDateMs = timeStore.currentDate.getTime()
  
  let p1 = ephemeris[0];
  let p2 = ephemeris[ephemeris.length - 1];

  if (currentDateMs <= p1.timestamp) {
    p2 = p1;
  } else if (currentDateMs >= p2.timestamp) {
    p1 = p2;
  } else {
    for (let i = 0; i < ephemeris.length - 1; i++) {
      if (currentDateMs >= ephemeris[i].timestamp && currentDateMs <= ephemeris[i+1].timestamp) {
        p1 = ephemeris[i];
        p2 = ephemeris[i+1];
        break;
      }
    }
  }

  let ratio = 0;
  if (p2.timestamp !== p1.timestamp) {
    ratio = (currentDateMs - p1.timestamp) / (p2.timestamp - p1.timestamp);
  }

  // Position relative to earth (in KM)
  const exactX_km = p1.x + (p2.x - p1.x) * ratio;
  const exactY_km = p1.y + (p2.y - p1.y) * ratio;
  const exactZ_km = p1.z + (p2.z - p1.z) * ratio;

  const distanceToEarth = Math.sqrt(exactX_km * exactX_km + exactY_km * exactY_km + exactZ_km * exactZ_km);
  
  // La contrainte de visibilité se fait maintenant par rapport à l'heure d'approche
  const approachDateMs = new Date(props.data.approachDateFull).getTime();
  const diffHours = Math.abs(currentDateMs - approachDateMs) / (1000 * 60 * 60);
  
  // Affiche l'astéroïde s'il est dans une fenêtre de +/- 12 heures de son approche la plus proche
  const isVisible = diffHours < 12;
  
  // Mapping NASA ecliptic (X, Y, Z) to ThreeJS (X, Z, -Y) mapping logic relative to Earth
  const tresX = exactX_km / SCALE_UNIT;
  const tresY = exactZ_km / SCALE_UNIT;
  const tresZ = -exactY_km / SCALE_UNIT;

  return { localPos: [tresX, tresY, tresZ], isVisible };
})

const rootPosition = computed(() => {
  return [
    timeStore.earthPosition.x,
    timeStore.earthPosition.y,
    timeStore.earthPosition.z
  ]
})

const orbitVertices = computed(() => {
  const ephemeris = props.data.ephemeris;
  if (!ephemeris || ephemeris.length === 0) return new Float32Array(0);

  const vertices = new Float32Array(ephemeris.length * 3);
  for (let i = 0; i < ephemeris.length; i++) {
    const pt = ephemeris[i];
    vertices[i * 3]     = pt.x / SCALE_UNIT;
    vertices[i * 3 + 1] = pt.z / SCALE_UNIT;
    vertices[i * 3 + 2] = -pt.y / SCALE_UNIT;
  }
  return vertices;
})

const scale = computed(() => {
  // taille réelle en mètres -> kilomètres (/1000)
  const sizeKm = props.data.size / 1000;
  // Converti en unités TresJS (1u = 100000km) avec un boost x500
  const sizeUnits = (sizeKm / SCALE_UNIT) * 500;
  
  // Taille minimum pour garantir la visibilité, même pour un caillou de 10m
  const clamped = Math.max(0.1, sizeUnits);
  return [clamped, clamped, clamped]
})
const emit = defineEmits(['click'])

const onClick = () => {
  emit('click', props.data)
}
</script>

<template>
  <TresGroup :position="rootPosition">
    <TresLine v-if="orbitVertices.length > 0">
      <TresBufferGeometry :position="[orbitVertices, 3]" />
      <TresLineBasicMaterial :color="0xffffff" :transparent="true" :opacity="0.8" />
    </TresLine>

    <TresMesh v-if="positionValues.isVisible" :position="positionValues.localPos" :scale="scale" @click="onClick">
      <TresDodecahedronGeometry :args="[1, 0]" />
      <TresMeshToonMaterial :color="data.isDangerous ? '#ff6600' : '#bbbbbb'" />
    </TresMesh>
  </TresGroup>
</template>
