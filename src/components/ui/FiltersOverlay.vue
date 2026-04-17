<script setup>
import { computed } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import DoubleSlider from './DoubleSlider.vue'

const timeStore = useTimeStore()

const filters = computed(() => timeStore.filters)

const updateFilter = (key, value) => {
  timeStore.setFilters({ [key]: value })
}
</script>

<template>
  <div class="backdrop" @click="timeStore.showFilters = false"></div>
  <div class="filters-panel" @click.stop>
    <h3>Filtres</h3>
    <span> {{ timeStore.countFilteredAsteroids }} astéroïdes affichés</span>
    
    <div class="toggle-row">
      <label class="switch">
        <input type="checkbox" :checked="filters.showDangerousOnly" @change="updateFilter('showDangerousOnly', $event.target.checked)">
        <span class="slider round"></span>
      </label>
      <span>Dangers uniquement</span>
    </div>

    <DoubleSlider 
      label="Diamètre" 
      unit="m" 
      :min="timeStore.bounds.minDiameter" :max="timeStore.bounds.maxDiameter" :step="10" 
      :modelValue="{ min: filters.minDiameter, max: filters.maxDiameter }" 
      @update:modelValue="val => { updateFilter('minDiameter', val.min); updateFilter('maxDiameter', val.max) }" 
    />

    <DoubleSlider 
      label="Vitesse" 
      unit="km/h" 
      :min="timeStore.bounds.minSpeed" :max="timeStore.bounds.maxSpeed" :step="1000" 
      :modelValue="{ min: filters.minSpeed, max: filters.maxSpeed }" 
      @update:modelValue="val => { updateFilter('minSpeed', val.min); updateFilter('maxSpeed', val.max) }" 
    />

    <DoubleSlider 
      label="Distance" 
      unit="M km" 
      :min="timeStore.bounds.minDistance" :max="timeStore.bounds.maxDistance" :step="1" 
      :modelValue="{ min: filters.minDistance, max: filters.maxDistance }" 
      @update:modelValue="val => { updateFilter('minDistance', val.min); updateFilter('maxDistance', val.max) }" 
    />
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 90;
}

.filters-panel {
  position: absolute;
  top: calc(100% + 15px);
  left: 0;
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  font-family: 'Inter', sans-serif;
  z-index: 100;
  pointer-events: auto;
  cursor: default;
}
@media (max-width: 768px) {
  .filters-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
  }
}
h3 { margin-top: 0; margin-bottom: 20px; font-weight: 900; color: #111; font-size: 1.2rem; }
.toggle-row { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; font-size: 0.9rem; font-weight: bold; color: #333; }

/* Switch CSS */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider { background-color: #d9534f; }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }
</style>
