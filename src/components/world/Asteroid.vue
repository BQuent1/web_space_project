<script>
import { TextureLoader, MeshStandardMaterial } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

const textureLoader = new TextureLoader()
const lavaColor = textureLoader.load('/textures/lava_rocks_01_2k/lava_rocks_01_color_2k.png')
const lavaNormal = textureLoader.load('/textures/lava_rocks_01_2k/lava_rocks_01_normal_gl_2k.png')
const lavaRoughness = textureLoader.load('/textures/lava_rocks_01_2k/lava_rocks_01_roughness_2k.png')
const lavaAO = textureLoader.load('/textures/lava_rocks_01_2k/lava_rocks_01_ambient_occlusion_2k.png')

const gltfLoader = new GLTFLoader()
const asteroidFiles = [
  '/models/asteroids_models/Asteroid_1a.glb',
  '/models/asteroids_models/Asteroid_1b.glb',
  '/models/asteroids_models/Asteroid_1c.glb',
  '/models/asteroids_models/Asteroid_1e.glb',
  '/models/asteroids_models/Asteroid_2a.glb',
  '/models/asteroids_models/Asteroid_2b.glb',
  '/models/asteroids_models/Asteroid_2c.glb'
]
const loadedModels = []
asteroidFiles.forEach(file => {
  gltfLoader.load(file, (gltf) => { loadedModels.push(gltf.scene) })
})
</script>
<script setup>
import { computed, ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { getAsteroidTresPosition } from '@/utils/ephemerisUtils'
import { useLoop } from '@tresjs/core'
import { Vector3, AdditiveBlending } from 'three'

const props = defineProps({
  position: Object, // passed but now dynamically computed
  size: Number,
  data: Object,
  index: Number,
})

const timeStore = useTimeStore()
const MAX_VISIBLE_DISTANCE_KM = 15000000 // 15 million km
const SCALE_UNIT = 100000 // 1 unit = 100k km

const particleRefs = ref([])
const particlesData = Array.from({ length: 15 }, () => ({
  x: 0, y: 0, z: 0,
  vx: 0, vy: 0, vz: 0,
  life: Math.random(),
  speed: 0.5 + Math.random()
}))

const asteroidDir = new Vector3(0, 0, 0)

watch(() => timeStore.currentDate, () => {
  const p1 = getAsteroidTresPosition(props.data.ephemeris, timeStore.currentDate.getTime());
  const p2 = getAsteroidTresPosition(props.data.ephemeris, timeStore.currentDate.getTime() + 3600*1000);
  if (p1 && p2) {
    // La direction opposée à sa trajectoire (p1 - p2)
    asteroidDir.set(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z).normalize();
  }
}, { immediate: true })

const { onBeforeRender } = useLoop()


const asteroidModelScene = shallowRef(null)
let retryTimer = null;

const assignRandomModel = () => {
  if (loadedModels.length > 0) {
    const hash = (props.data.id || "0").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % loadedModels.length;
    
    const clonedScene = SkeletonUtils.clone(loadedModels[index]);
    
    asteroidModelScene.value = clonedScene;
  } else {
    retryTimer = setTimeout(assignRandomModel, 300);
  }
};

onMounted(() => assignRandomModel())
onUnmounted(() => { if(retryTimer) clearTimeout(retryTimer) })

onBeforeRender(({ delta, elapsed }) => {
  const mScale = scaleInfo.value.vec[0];

  if (!isSelected.value || !particleRefs.value.length) return;

  // Animation des Traînées
  particleRefs.value.forEach((mesh, index) => {
    if (!mesh) return;
    
    let p = particlesData[index];
    p.life -= delta * 1.5;
    
    if (p.life <= 0) {
      p.life = 1;
      p.x = 0; p.y = 0; p.z = 0;
      
      const spread = 0.8;
      // Propulsées dans la direction de la queue de la comète + diffusion radiale
      p.vx = asteroidDir.x * 2 * mScale + (Math.random() - 0.5) * spread * mScale;
      p.vy = asteroidDir.y * 2 * mScale + (Math.random() - 0.5) * spread * mScale;
      p.vz = asteroidDir.z * 2 * mScale + (Math.random() - 0.5) * spread * mScale;
    }

    p.x += p.vx * delta * p.speed * 5;
    p.y += p.vy * delta * p.speed * 5;
    p.z += p.vz * delta * p.speed * 5;

    mesh.position.set(p.x, p.y, p.z);
    
    // Le haut du cone pointe face au vecteur de déplacement des particules
    const up = new Vector3(0, 1, 0);
    const vel = new Vector3(p.vx, p.vy, p.vz).normalize();
    mesh.quaternion.setFromUnitVectors(up, vel);
    
    if (mesh.material) {
      mesh.material.opacity = p.life * 0.8;
    }
    mesh.scale.setScalar(p.life * mScale * 1.2);
  });
})

const positionValues = computed(() => {
  const ephemeris = props.data.ephemeris;
  if (!ephemeris || ephemeris.length === 0) {
    return { localPos: [0, 0, 0], isVisible: false };
  }

  const currentDateMs = timeStore.currentDate.getTime();
  const localPos = getAsteroidTresPosition(ephemeris, currentDateMs);
  if (!localPos) {
    return { localPos: [0, 0, 0], isVisible: false };
  }

  const SCALE_UNIT = 100000;
  const exactX_km = localPos.x * SCALE_UNIT;
  const exactZ_km = localPos.y * SCALE_UNIT;
  const exactY_km = -localPos.z * SCALE_UNIT;
  const distanceToEarth = Math.sqrt(exactX_km*exactX_km + exactY_km*exactY_km + exactZ_km*exactZ_km);

  const approachDateMs = new Date(props.data.approachDateFull).getTime();
  const diffHours = Math.abs(currentDateMs - approachDateMs) / (1000 * 60 * 60);
  
  const isVisible = diffHours < 12;

  const isSelected = timeStore.selectedAsteroid && timeStore.selectedAsteroid.id === props.data.id;

  return { localPos: [localPos.x, localPos.y, localPos.z], isVisible: isVisible || isSelected };
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

const scaleInfo = computed(() => {
  const sizeKm = props.data.size / 1000;
  const trueSizeUnits = sizeKm / SCALE_UNIT;
  const sizeUnits = trueSizeUnits * 500;
  
  // Augmentation de la taille minimum visible
  const clamped = Math.max(0.1, sizeUnits);
  
  const multiplier = Math.round(clamped / trueSizeUnits);
  
  return {
    vec: [clamped, clamped, clamped],
    multiplier: multiplier
  };
})
const emit = defineEmits(['click'])

const isSelected = computed(() => timeStore.selectedAsteroid?.id === props.data.id)

const isHovered = ref(false)
const onPointerEnter = () => { isHovered.value = true; document.body.style.cursor = 'pointer'; }
const onPointerLeave = () => { isHovered.value = false; document.body.style.cursor = 'auto'; }

const onClick = () => {
  const augmentedData = { ...props.data, displayMultiplier: scaleInfo.value.multiplier };
  emit('click', augmentedData)
}
</script>

<template>
  <TresGroup :position="rootPosition">
    <TresLine v-if="orbitVertices.length > 0" @click="onClick" @pointer-enter="onPointerEnter" @pointer-leave="onPointerLeave">
      <TresBufferGeometry :position="[orbitVertices, 3]" />
      <TresLineBasicMaterial :color="isHovered ? '#ffffff' : (data.isDangerous ? '#ff9999' : '#cccccc')" :transparent="true" :opacity="isHovered ? 1.0 : 0.6" />
    </TresLine>

    <TresGroup v-if="positionValues.isVisible" :position="positionValues.localPos">
      <primitive v-if="asteroidModelScene" :object="asteroidModelScene" :scale="scaleInfo.vec" @click="onClick" @pointer-enter="onPointerEnter" @pointer-leave="onPointerLeave" />
      <!-- au cas ou pas de modèle 3D -->
      <TresMesh v-else :scale="scaleInfo.vec" @click="onClick" @pointer-enter="onPointerEnter" @pointer-leave="onPointerLeave">
        <TresSphereGeometry :args="[1, 6, 6]" />
        <TresMeshStandardMaterial 
          :flat-shading="true"
          :color="data.isDangerous ? '#ff8844' : '#aaaaaa'" 
          :map="lavaColor"
          :normal-map="lavaNormal"
          :roughness-map="lavaRoughness"
          :ao-map="lavaAO"
        />
      </TresMesh>
      

      <!-- Particules customisées (traînées orientées) -->
      <TresGroup v-if="isSelected">
        <TresMesh 
          v-for="i in 15" 
          :key="i" 
          :ref="(el) => { if (el) particleRefs[i-1] = el }"
        >
          <TresConeGeometry :args="[0.5, 1.2, 5]" />
          <TresMeshBasicMaterial 
            :color="data.isDangerous ? '#ff3300' : '#ffcc00'" 
            :transparent="true" 
            :blending="AdditiveBlending"
            :depthWrite="false"
          />
        </TresMesh>
      </TresGroup>
    </TresGroup>
  </TresGroup>
</template>
