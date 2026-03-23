<script setup>
import { computed, ref } from 'vue'
import { useTimeStore } from '@/stores/timeStore'

const props = defineProps({
  position: Object,
  size: Number,
  data: Object,
  index: Number,
})

const timeStore = useTimeStore()
const isVisible = ref(true)
const MAX_VISIBLE_DISTANCE_KM = 50000000 // 50 millions km

const position = computed(() => {
  const ephemeris = props.data.ephemeris;
  if (!ephemeris || ephemeris.length === 0) {
    isVisible.value = false;
    return [0, 0, 0];
  }

  const currentDateMs = timeStore.currentDate.getTime()
  
  // Find surrounding ephemeris points (this assumes the array is sorted by timestamp)
  let p1 = ephemeris[0];
  let p2 = ephemeris[ephemeris.length - 1];

  // If outside bounds, hide or clamp. Let's clamp to closest known point and stay there
  if (currentDateMs <= p1.timestamp) {
    p2 = p1;
  } else if (currentDateMs >= p2.timestamp) {
    p1 = p2;
  } else {
    // Find exact interpolation interval
    for (let i = 0; i < ephemeris.length - 1; i++) {
      if (currentDateMs >= ephemeris[i].timestamp && currentDateMs <= ephemeris[i+1].timestamp) {
        p1 = ephemeris[i];
        p2 = ephemeris[i+1];
        break;
      }
    }
  }

  // Linear interpolation setup
  let ratio = 0;
  if (p2.timestamp !== p1.timestamp) {
    ratio = (currentDateMs - p1.timestamp) / (p2.timestamp - p1.timestamp);
  }

  // Position relative to earth (in KM)
  const exactX_km = p1.x + (p2.x - p1.x) * ratio;
  const exactY_km = p1.y + (p2.y - p1.y) * ratio;
  const exactZ_km = p1.z + (p2.z - p1.z) * ratio;

  // Visibility check
  const distanceToEarth = Math.sqrt(exactX_km * exactX_km + exactY_km * exactY_km + exactZ_km * exactZ_km);
  isVisible.value = distanceToEarth < MAX_VISIBLE_DISTANCE_KM;

  // Scaling to TresJS scene units (1 unit = 1 million km)
  // Mapping NASA ecliptic (X, Y, Z) to ThreeJS (X, Z, -Y) mapping logic:
  // Usually ThreeJS Y is Up. Horizons Z is Up. 
  // tres.x = horizon.x
  // tres.y = horizon.z 
  // tres.z = -horizon.y
  
  const scaleUnit = 1000000;
  
  const tresX = exactX_km / scaleUnit;
  const tresY = exactZ_km / scaleUnit;
  const tresZ = -exactY_km / scaleUnit;

  // Offset by the Earth current dynamic position to represent the actual World coordinate
  return [
    tresX + timeStore.earthPosition.x,
    tresY + timeStore.earthPosition.y,
    tresZ + timeStore.earthPosition.z
  ]
})

const scale = computed(() => {
  const s = props.data.size / 100
  return Math.max(0.5, Math.min(s, 5.0))
})
const emit = defineEmits(['click'])

const onClick = () => {
  emit('click', props.data)
}
</script>

<template>
  <TresMesh v-if="isVisible" :position="position" :scale="scale" @click="onClick">
    <TresDodecahedronGeometry :args="[1, 0]" />
    <TresMeshToonMaterial :color="data.isDangerous ? '#ff6600' : '#888888'" />
  </TresMesh>
</template>
