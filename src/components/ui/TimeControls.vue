<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { nasaService } from '@/services/nasaApi'

const timeStore = useTimeStore()
const asteriodPoints = ref([])

onMounted(async () => {
  const data = await nasaService.getAsteroids()

  asteriodPoints.value = data.map(a => {
    const approachDateFull = a.close_approach_data[0].close_approach_date_full
    console.log(approachDateFull)
    const dateObj = new Date(approachDateFull)
    const minutes = (dateObj.getHours() * 60) + dateObj.getMinutes()

    return {
      id: a.id,
      name: a.name,
      time: minutes,
    }
  })
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
    <div class="date-container">
      <input type="date" v-model="formattedDate" class="date-input" />
      <div class="date-display">{{ timeStore.currentDate.toLocaleDateString() }}</div>
    </div>
    <div class="timeline-container">
      <div class="hours-labels">
        <span>00h</span>
        <span>12h</span>
        <span>23h</span>
      </div>

      <div class="track-wrapper">
        <div class="graduation-dots">
          <span v-for="i in 24" :key="i" class="dot-gray"></span>
        </div>

        <div v-for="pt in asteriodPoints" :key="pt.id" class="dot-red" :style="{ left: (pt.time / 1440) * 100 + '%' }">
        </div>

        <div class="time-pin" :style="{ left: (currentMinutes / 1440) * 100 + '%' }">
          <div class="pin-icon">⋮</div>
        </div>

        <input type="range" v-model.number="currentMinutes" min="0" max="1439" class="invisible-range" />
      </div>
    </div>
    <div class="pause-button-container">
      <button class="pause-button" @click="timeStore.isPaused = !timeStore.isPaused">
        <svg v-if="!timeStore.isPaused" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <rect x="5" y="3" width="4" height="18" fill="#333" />
          <rect x="15" y="3" width="4" height="18" fill="#333" />
        </svg>

        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <polygon points="5,3 19,12 5,21" fill="#333" />
        </svg>
      </button>

    </div>
    <div class="time-selector-container">
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
  right: 20px;
  z-index: 100;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-left: 3%;
}

.time-selector-container,
.pause-button-container {
  pointer-events: auto;
  display: flex;
  width: max-content;
  align-items: center;
  background: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: sans-serif;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.date-container {
  pointer-events: auto;
  background: white;
  padding: 10px 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-input {
  border: none;
  background: #f0f0f0;
  padding: 5px;
  border-radius: 8px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}

.date-display {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  font-weight: bold;
}

.pause-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.dropdown {
  position: relative;
  margin-left: 10px;
}

.current-value {
  background: #f0f0f0;
  border: none;
  padding: 8px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  min-width: 50px;
}

.options-list {
  position: absolute;
  top: 0;
  left: 0;
  background: #f5f5f5;
  list-style: none;
  padding: 0;
  margin: 0;
  border-radius: 10px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.options-list li {
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
}

.options-list li:hover {
  background: #e0e0e0;
}

.options-list li.active {
  background: #d0d0d0;
}



/* day slider */
.timeline-container {
  pointer-events: auto;
  background: white;
  padding: 10px 30px 20px 30px;
  border-radius: 15px;
  width: 500px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.hours-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #333;
  margin-bottom: 10px;
}

.track-wrapper {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.graduation-dots {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.dot-gray {
  width: 4px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 50%;
}

.dot-red {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #d9534f;
  border-radius: 50%;
  z-index: 2;
  transform: translateX(-50%);
}

/* Le curseur style Pin gris */
.time-pin {
  position: absolute;
  top: -15px;
  /* Ajusté pour survoler */
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: none;
  transition: left 0.1s ease-out;
}

.pin-icon {
  background: #c0c0c0;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 10px;
  color: #444;
  position: relative;
}

.pin-icon::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #999;
}

.invisible-range {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
  height: 100%;
}
</style>
