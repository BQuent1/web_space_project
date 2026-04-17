<script setup>
import { useTimeStore } from '@/stores/timeStore'
import { ref, watch } from 'vue'

const timeStore = useTimeStore()
const isMinimized = ref(false)

watch(() => timeStore.selectedAsteroid, () => {
  isMinimized.value = false;
})

const untrackAsteroid = () => {
  timeStore.clearSelectedAsteroid()
}
</script>

<template>
  <div v-if="timeStore.selectedAsteroid">
    <div v-if="!isMinimized" class="details-panel">
      <button class="close-btn" @click="isMinimized = true" title="Réduire">_</button>
      <h2 class="title">{{ timeStore.selectedAsteroid.name }}</h2>
    
    <div class="card">
      <div class="card-row">
        <span>Type</span>
        <span>☄️ Astéroïde</span>
      </div>
      <div class="card-row">
        <span>Date d'approche</span>
        <span>{{ timeStore.selectedAsteroid.approachDateFull }}</span>
      </div>
      <div class="card-row">
        <span>Dangerosité</span>
        <span>{{ timeStore.selectedAsteroid.isDangerous ? 'Élevée' : 'Minime' }}</span>
      </div>
    </div>

    <div class="description">
      <p><strong>Vitesse relative :</strong> {{ parseInt(timeStore.selectedAsteroid.velocity).toLocaleString() }} km/h</p>
      <p>
        <strong>Diamètre estimé :</strong> {{ ~~(timeStore.selectedAsteroid.size) }} mètres
        <span class="scale-info" v-if="timeStore.selectedAsteroid.displayMultiplier">
          (Affiché ×{{ timeStore.selectedAsteroid.displayMultiplier.toLocaleString() }})
        </span>
      </p>
      <p><strong>Distance de la Terre :</strong> {{ parseInt(timeStore.selectedAsteroid.distance).toLocaleString() }} km (environ {{ ((parseInt(timeStore.selectedAsteroid.distance) * 1000) / 105).toLocaleString() }} terrains de foot)</p>
      <div class="divider"></div>
      <p v-if="timeStore.selectedAsteroid.isDangerous" class="danger-text">Cet objet est classifié comme potentiellement dangereux par la NASA car il croise l'orbite terrestre de très près et possède une taille significative.</p>
    <p v-else>Cet astéroïde passera à une distance de sécurité raisonnable et ne présente aucun risque de collision pour cette période.</p>
    </div>
    
      <button class="untrack-button" @click="untrackAsteroid">
        Retourner à la Terre
      </button>
    </div>

    <!-- Mode minimisé -->
    <div v-else class="minimized-panel" @click="isMinimized = false" title="Agrandir">
      <span class="mini-info">{{ timeStore.selectedAsteroid.name }}</span>
      <button class="untrack-btn-mini" @click.stop="untrackAsteroid" title="Retourner à la Terre"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- svg de croix pour fermer -->
        <path d="M18 6L6 18M6 6L18 18" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
</button>
    </div>
  </div>
</template>

<style scoped>
.details-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  font-family: 'Inter', sans-serif;
  color: #333;
  z-index: 200;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .details-panel {
    top: 65px;
    right: 10px;
    left: 10px;
    width: auto;
    max-height: 40vh;
    overflow-y: auto;
  }
}

.close-btn {
  position: absolute;
  top: 6px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  font-weight: bold;
  cursor: pointer;
  color: #666;
  padding: 0;
}

.close-btn:hover {
  color: #000;
}

.title {
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: 900;
  color: #000;
}

.card {
  background: #f4f4f4;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.card-row:last-child {
  margin-bottom: 0;
}

.card-row span:last-child {
  font-weight: bold;
  text-align: right;
  max-width: 60%;
}

.description {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #555;
}

.description p {
  margin: 5px 0;
}

.scale-info {
  display: block;
  font-size: 0.75rem;
  color: #888;
  font-style: italic;
  margin-top: 2px;
}

.divider {
  height: 1px;
  background: #eee;
  margin: 15px 0;
}

.danger-text {
  color: #d9534f;
  font-weight: bold;
  margin-top: 10px !important;
}

.untrack-button {
  background: rgba(154, 156, 157, 0.9);
  color: black;
  border: none;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 1rem;
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.2s;
}
.untrack-button:hover {
  background: rgba(178, 179, 180, 0.9);
}

.minimized-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 8px 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  font-family: 'Inter', sans-serif;
  color: #333;
  z-index: 200;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.95rem;
}
.minimized-panel:hover {
  background: rgba(255, 255, 255, 0.95);
}

.mini-info {
  white-space: nowrap;
}

.untrack-btn-mini {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.untrack-btn-mini:hover {
  transform: scale(1.15);
}

@media (max-width: 768px) {
  .minimized-panel {
    top: 65px;
    right: 10px;
  }
}
</style>
