<script setup>
import { useTimeStore } from '@/stores/timeStore'
const timeStore = useTimeStore()
</script>

<template>
  <div v-if="timeStore.isLoading" class="loading-overlay">
    <div class="loading-box">
      <div class="spinner"></div>
      <span class="loading-text">Chargement des données</span>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  pointer-events: none;
}

.loading-box {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: #111;
  font-weight: 500;
}
</style>
