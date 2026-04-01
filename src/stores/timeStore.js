import { defineStore } from 'pinia'

// 1 = 1 seconde par seconde
// 60 = 1 minute par seconde
// 3600 = 1 heure par seconde
// 86400 = 1 jour par seconde
// 604800 = 1 semaine par seconde
// 2592000 = 1 mois par seconde
// 31536000 = 1 année par seconde

export const useTimeStore = defineStore('time', {
  // données
  state: () => ({
    currentDate: new Date(),
    multiplier: 1, // vitesse
    currentLabel: '1s',
    isPaused: false,
    earthPosition: {
      x: 150,
      y: 0,
      z: 0,
    },
    asteroids: [],
    selectedAsteroid: null,
    isLoading: false,
    showFilters: false,
    bounds: {
      minDiameter: 0,
      maxDiameter: 5000,
      minSpeed: 0,
      maxSpeed: 150000,
      minDistance: 0,
      maxDistance: 75
    },
    filters: {
      minDiameter: 0,
      maxDiameter: 5000,
      minSpeed: 0,
      maxSpeed: 150000,
      minDistance: 0,
      maxDistance: 75000000, // 75 million km
      showDangerousOnly: false
    }
  }),

  getters: {
    countFilteredAsteroids(state) {
      return state.asteroids.filter(a => {
        if (state.filters.showDangerousOnly && !a.isDangerous) return false;
        if (a.size < state.filters.minDiameter || a.size > state.filters.maxDiameter) return false;
        
        const speed = parseFloat(a.velocity);
        if (speed < state.filters.minSpeed || speed > state.filters.maxSpeed) return false;
        
        const distM = parseFloat(a.distance) / 1000000;
        if (distM < state.filters.minDistance || distM > state.filters.maxDistance) return false;

        return true;
      }).length;
    }
  },
  // méthodes
  actions: {
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },
    resetFilters(b) {
      this.filters = {
        minDiameter: b.minDiameter, maxDiameter: b.maxDiameter,
        minSpeed: b.minSpeed, maxSpeed: b.maxSpeed,
        minDistance: b.minDistance, maxDistance: b.maxDistance,
        showDangerousOnly: false
      }
    },
    setSelectedAsteroid(data) {
      this.selectedAsteroid = data
    },
    clearSelectedAsteroid() {
      this.selectedAsteroid = null
    },
    setAsteroids(data) {
      this.asteroids = data
    },
    setSpeed(value) {
      this.multiplier = value
    },
    togglePause() {
      this.isPaused = !this.isPaused
    },
    // affichage
    tick(delta) {
      if (!this.isPaused) {
        const msToAdd = delta * this.multiplier * 1000
        this.currentDate = new Date(this.currentDate.getTime() + msToAdd)
      }
    },
    updateEarthPosition(x, y, z) {
      this.earthPosition = { x, y, z }
    },
    updateCurrentDate(date) {
      this.currentDate = date
    },
  },
})
