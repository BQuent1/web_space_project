<script setup>
const emit = defineEmits(['start'])
</script>

<template>
  <div class="landing-page">
    <div class="content">
      <h1 class="title">Will We Die</h1>
      <p class="description">
        Will We Die (WWD) est une application 3D temps réel qui vous permet de visualiser les astéroïdes géocroiseurs qui s'approchent de la Terre aujourd'hui ou à la date de votre choix.
        <br><br>
        Les données sont extraites en temps réel depuis l'API NeoWs (Near Earth Object Web Service) de la NASA.
        Identifiez, leurs orbites, leurs distances et tailles réelles !
      </p>

      <button class="start-button" @click="emit('start')">
        Lancer l'exploration
      </button>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  position: fixed;
  inset: 0;
  background-color: #050510;
  background-image: radial-gradient(circle at 50% 50%, #1a1a3a 0%, #000000 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  font-family: 'Inter', sans-serif;
  overflow-y: auto;
  padding: 20px;
}

.content {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 600px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: fadeIn 1s ease-out forwards;
}

.title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  background: linear-gradient(135deg, #fff, #8ba4f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #ccc;
  margin-bottom: 30px;
  text-align: justify;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  padding: 15px 20px;
  border-radius: 12px;
  font-weight: 500;
}

.icon {
  font-size: 1.5rem;
}

.start-button {
  background: #2b78e4;
  color: white;
  border: none;
  padding: 16px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(43, 120, 228, 0.4);
}

.start-button:hover {
  background: #3a8dfc;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(43, 120, 228, 0.6);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .content { padding: 30px 20px; }
  .title { font-size: 2rem; }
  .description { font-size: 1rem; }
}
</style>
