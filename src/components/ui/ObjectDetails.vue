<script setup>
import { useTimeStore } from '@/stores/timeStore'

const timeStore = useTimeStore()

const closePanel = () => {
  timeStore.clearSelectedAsteroid()
}
</script>

<template>
  <div v-if="timeStore.selectedAsteroid" class="details-panel">
    <button class="close-btn" @click="closePanel">✕</button>
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
  </div>
</template>

<style scoped>
.details-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 330px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  font-family: 'Inter', sans-serif;
  color: #333;
  z-index: 200;
  pointer-events: auto;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  color: #666;
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
</style>
