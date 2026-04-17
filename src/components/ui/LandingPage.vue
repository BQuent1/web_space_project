<script setup>
const emit = defineEmits(['start'])
</script>

<template>
  <div class="landing-page">
    <div class="content">
      <img src="/wwd_img.png" alt="WWD Logo" class="logo" />

      <p class="description">
        <strong>Will We Die (WWD)</strong> est une application 3D temps réel qui vous permet de visualiser les astéroïdes géocroiseurs qui s'approchent de la Terre aujourd'hui ou à la date de votre choix.
        <br>
        Les données sont extraites en temps réel depuis l'API NeoWs (Near Earth Object Web Service) de la NASA.
        Identifiez leurs orbites, leurs distances et tailles réelles !
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
  background-color: #000;
  background-image: url('/textures/2k_stars.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: #000;
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  overflow-y: auto;
  padding: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  width: 100%;
  padding: 40px;
  animation: fadeIn 0.8s ease-out forwards;
}

.logo {
  filter: invert(1);
  max-width: 200px;
  width: 100%;
  margin-bottom: 15px;
  height: auto;
  mix-blend-mode: screen; /* 'screen' efface le noir de l'image inversée pour laisser voir les étoiles ! */
}

.description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 40px;
  text-align: center;
  font-weight: 500;
}

.start-button {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 50px;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  text-transform: uppercase;
  letter-spacing: 2px;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.start-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 768px) {
  .logo { max-width: 200px; }
  .description { font-size: 1.05rem; }
  .start-button { font-size: 1.1rem; padding: 15px 30px; }
  .content { padding: 20px; }
}
</style>
