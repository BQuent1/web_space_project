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
    multiplier: 604800, // vitesse
    isPaused: false,
    earthPosition: {
      x: 150,
      y: 0,
      z: 0,
    },
  }),

  // méthodes
  actions: {
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
  },
})
