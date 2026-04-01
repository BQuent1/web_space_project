<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { nasaService } from '@/services/nasaApi'
import FiltersOverlay from './FiltersOverlay.vue'

const timeStore = useTimeStore()
const asteriodPoints = ref([])

const getLocalDayString = (d) => {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

let lastLoadedDay = '';

const loadAsteroidsForDate = async (date) => {
  timeStore.isLoading = true;
  try {
    const data = await nasaService.getAsteroids(date)
    timeStore.setAsteroids(data)

    if (data.length > 0) {
      const dMin = Math.min(...data.map(a => a.size));
      const sMin = Math.min(...data.map(a => parseFloat(a.velocity)));
      const distMin = Math.min(...data.map(a => parseFloat(a.distance) / 1000000));

      const dMax = Math.max(...data.map(a => a.size));
      const sMax = Math.max(...data.map(a => parseFloat(a.velocity)));
      const distMax = Math.max(...data.map(a => parseFloat(a.distance) / 1000000));
      
      timeStore.bounds = {
         minDiameter: Math.floor(dMin), maxDiameter: Math.max(10, Math.ceil(dMax)),
         minSpeed: Math.floor(sMin), maxSpeed: Math.max(10, Math.ceil(sMax)),
         minDistance: Math.max(0, Math.floor(distMin)), maxDistance: Math.max(1, Math.ceil(distMax))
      };
      // Reset filters so that all asteroids of this day fit into the new bounds precisely
      timeStore.resetFilters(timeStore.bounds);
    }

    asteriodPoints.value = data.map(a => {
      const approachDateFull = a.approachDateFull
      const dateObj = new Date(approachDateFull)
      const minutes = (dateObj.getHours() * 60) + dateObj.getMinutes()

      return {
        id: a.id,
        name: a.name,
        time: minutes,
        asteroidData: a
      }
    })
  } finally {
    timeStore.isLoading = false;
  }
}

const onDotClick = (pt) => {
  timeStore.isPaused = true;
  currentMinutes.value = pt.time;
  timeStore.setSelectedAsteroid(pt.asteroidData);
}

onMounted(() => {
  lastLoadedDay = getLocalDayString(timeStore.currentDate);
  loadAsteroidsForDate(timeStore.currentDate);
})

import { watch } from 'vue'

let debounceTimer = null;

watch(() => timeStore.currentDate, (newDate) => {
  const newDay = getLocalDayString(newDate);
  if (newDay !== lastLoadedDay) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      lastLoadedDay = newDay;
      loadAsteroidsForDate(newDate);
    }, 500);
  }
})

const currentMinutes = computed({
  get: () => timeStore.currentDate.getHours() * 60 + timeStore.currentDate.getMinutes(),
  set: (val) => {
    const d = new Date(timeStore.currentDate)
    d.setHours(Math.floor(val / 60), val % 60)
    timeStore.updateCurrentDate(d)
  }
})

const isOpen = ref(false)

const timeOptions = [
  { label: '1s', value: 1 },
  { label: '1h', value: 3600 },
  { label: '6h', value: 21600 },
  { label: '1j', value: 86400 },
  { label: '1w', value: 604800 },
]

const selectSpeed = (option) => {
  timeStore.multiplier = option.value
  timeStore.currentLabel = option.label
  isOpen.value = false
}

const formattedDate = computed({
  get() {
    return timeStore.currentDate.toISOString().split('T')[0]
  },
  set(newValue) {
    timeStore.updateCurrentDate(new Date(newValue))
  }
})

</script>

<template>
  <div class="ui-layer">
    
    <!-- Filtres Button -->
    <div class="filters-wrapper">
      <button class="control-box btn-text" @click="timeStore.showFilters = !timeStore.showFilters">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filtres
      </button>
      
      <!-- The filters panel is injected here, allowing it to float above the button -->
      <FiltersOverlay v-if="timeStore.showFilters" />
    </div>

    <!-- Date selector -->
    <div class="control-box date-container">
      <input type="date" v-model="formattedDate" class="date-input" />
    </div>

    <!-- Timeline -->
    <div class="control-box timeline-container">
      <div class="hours-labels">
        <span>00h</span>
        <span>12h</span>
        <span>23h</span>
      </div>

      <div class="track-wrapper">
        <input type="range" v-model.number="currentMinutes" min="0" max="1439" class="invisible-range" />
        
        <div class="graduation-dots">
          <span v-for="i in 24" :key="i" class="dot-gray"></span>
        </div>

        <div v-for="pt in asteriodPoints" :key="pt.id" class="dot-red" 
             :style="{ left: (pt.time / 1440) * 100 + '%' }"
             @click="onDotClick(pt)">
        </div>

        <div class="time-pin" :style="{ left: (currentMinutes / 1440) * 100 + '%' }">
          <div class="pin-icon">⋮</div>
        </div>
      </div>
    </div>

    <!-- Refresh Button -->
    <button class="control-box icon-btn" title="Revenir à l'heure actuelle" @click="timeStore.updateCurrentDate(new Date())">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2v6h-6"></path>
        <path d="M21 13a9 9 0 1 1-3-7.7L21 8"></path>
      </svg>
    </button>

    <!-- Pause Button -->
    <button class="control-box icon-btn" title="Pause / Reprise" @click="timeStore.isPaused = !timeStore.isPaused">
      <svg v-if="!timeStore.isPaused" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <rect x="5" y="3" width="4" height="18" fill="#555" />
        <rect x="15" y="3" width="4" height="18" fill="#555" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <polygon points="5,3 19,12 5,21" fill="#333" />
      </svg>
    </button>

    <!-- Speed Options -->
    <div class="control-box time-selector-container">
      <span class="label">1s = </span>

      <div class="dropdown">
        <button class="current-value" @click="isOpen = !isOpen">
          {{ timeStore.currentLabel }}
        </button>

        <ul v-if="isOpen" class="options-list">
          <li v-for="opt in timeOptions" :key="opt.label" @click="selectSpeed(opt)"
            :class="{ active: timeStore.currentLabel === opt.label }">
            {{ opt.label }}
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ui-layer {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.filters-wrapper {
  position: relative;
}

.control-box {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10px 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  height: 50px; /* Force uniform height */
  box-sizing: border-box;
  border: none;
}

.icon-btn {
  cursor: pointer;
  padding: 0 15px;
  transition: transform 0.1s;
}
.icon-btn:hover {
  transform: translateY(-2px);
}

.btn-text {
  cursor: pointer;
  font-weight: bold;
  color: #333;
  font-size: 1rem;
  transition: background 0.2s;
}
.btn-text:hover {
  background: white;
}

.flex-col {
  flex-direction: column;
  justify-content: space-evenly;
}

.date-container {
  gap: 2px;
}

.date-input {
  border: none;
  background: transparent;
  font-family: inherit;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  color: #333;
}

.date-display {
  font-size: 0.70rem;
  color: #777;
  font-weight: bold;
}

.time-selector-container {
  gap: 5px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
}

.dropdown {
  position: relative;
}

.current-value {
  background: #f0f0f0;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  font-family: inherit;
  min-width: 55px;
}

.options-list {
  position: absolute;
  top: calc(100% + 15px);
  left: 0;
  background: #fcfcfc;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 10px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.options-list li {
  padding: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.options-list li:hover { background: #eee; }
.options-list li.active { background: #e0e0e0; }

/* Timeline Slider */
.timeline-container {
  width: 400px; /* Slightly compacted */
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 0 20px;
}

.hours-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #777;
  font-weight: bold;
  margin-bottom: 2px;
}

.track-wrapper {
  position: relative;
  height: 16px;
  display: flex;
  align-items: center;
}

.graduation-dots {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 4px; /* Align with track */
}

.dot-gray {
  width: 4px;
  height: 4px;
  background: #ccc;
  border-radius: 50%;
}

.dot-red {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #d9534f;
  border-radius: 50%;
  z-index: 5;
  transform: translateX(-50%);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  pointer-events: auto;
}

.dot-red:hover {
  transform: translateX(-50%) scale(1.5);
  background: #ff3333;
}

/* Time Pin */
.time-pin {
  position: absolute;
  top: -12px;
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: none;
  transition: left 0.1s ease-out;
}

.pin-icon {
  background: #444;
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 9px;
  color: #fff;
  font-weight: bold;
  position: relative;
}

.pin-icon::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #444;
}

.invisible-range {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
  height: 100%;
  z-index: 4;
}
</style>
