import { defineStore } from 'pinia'

export const useTimeStore = defineStore('time', {
  // données
  state: () => ({
    currentDate: new Date(),
    multiplier: 1, // vitesse
    isPaused: false,
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
  },
})
