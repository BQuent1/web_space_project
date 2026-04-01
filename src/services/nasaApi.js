const API_KEY = 'nN3wCQcOohEwA8xbWD00dTSOSSJ6EbWRHQS1u0aF';
const BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

const AU_IN_KM = 149597870.7;

// details : https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27DES=2015%20PU56%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&START_TIME=%272026-02-02%27&STOP_TIME=%272026-02-03%27

const asteroidCache = new Map();

export const nasaService = {
  getAsteroids(baseDate = new Date()) {
    const todayStr = baseDate.toISOString().split('T')[0];

    if (asteroidCache.has(todayStr)) {
      return asteroidCache.get(todayStr);
    }

    const promise = (async () => {
      try {
        const tomorrow = new Date(baseDate);
        tomorrow.setDate(tomorrow.getDate() + 2);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const chaine = `${BASE_URL}/feed?start_date=${todayStr}&end_date=${todayStr}&api_key=${API_KEY}`;
        console.log(`Fetching asteroids list for ${todayStr}...`);

        const response = await fetch(chaine);
        const data = await response.json();

        const rawAsteroids = data.near_earth_objects[todayStr] || [];

        // Parcourir chaque astéroïde séquentiellement pour éviter l'erreur HTTP 503 (rate-limit de NASA JPL)
        const asteroidsWithEphemeris = [];

        for (const asteroid of rawAsteroids) {
          let ephemeris = [];
          const cleanName = asteroid.name.replace('(', '').replace(')', '').trim();

          try {
            // Attendre 300ms entre chaque requête pour éviter le blocage
            await new Promise(resolve => setTimeout(resolve, 300));
            ephemeris = await this.getAsteroidEphemeris(cleanName, todayStr, tomorrowStr);
          } catch (e) {
            console.warn(`Erreur de récupération éphéméride pour ${cleanName}`, e);
          }

          asteroidsWithEphemeris.push({
            id: asteroid.id,
            name: cleanName,
            size: asteroid.estimated_diameter.meters.estimated_diameter_max,
            velocity: asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour,
            distance: asteroid.close_approach_data[0].miss_distance.kilometers,
            isDangerous: asteroid.is_potentially_hazardous_asteroid,
            approachDateFull: asteroid.close_approach_data[0].close_approach_date_full,
            ephemeris: ephemeris // Ajout du tableau d'éphémérides { timeTDB, X, Y, Z }
          });
        }

        return asteroidsWithEphemeris;
      } catch (error) {
        asteroidCache.delete(todayStr); // Réinitialiser en cas d'erreur
        console.error(`Erreur globale pour la date ${todayStr}:`, error);
        return [];
      }
    })();

    asteroidCache.set(todayStr, promise);
    return promise;
  },

  /**
   * Récupère la trajectoire d'un objet via l'API JPL Horizons
   * @param {string} designation - ex: "2015 PU56"
   */
  async getAsteroidEphemeris(designation, startDate, endDate) {
    // 1. On prépare les paramètres proprement. 
    // La NASA attend souvent les valeurs entre apostrophes, mais le tout doit être encodé.
    const command = `DES=${designation}`;

    const params = new URLSearchParams({
      format: 'text',
      COMMAND: `'${command}'`, // La NASA veut des apostrophes autour de la commande
      OBJ_DATA: "'NO'",
      MAKE_EPHEM: "'YES'",
      EPHEM_TYPE: "'VECTORS'",
      START_TIME: `'${startDate}'`,
      STOP_TIME: `'${endDate}'`,
      STEP_SIZE: "'1 h'",
      CENTER: "'399'",
      CSV_FORMAT: "'YES'"
    });

    const apiPath = `/api/horizons.api?${params.toString()}`;
    const targetUrl = `https://ssd.jpl.nasa.gov${apiPath}`;

    // 2. Sélection de l'URL selon l'environnement
    // Note: AllOrigins /raw est souvent instable. corsproxy.io est une excellente alternative.
    const url = import.meta.env.DEV
      ? apiPath
      : `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const text = await response.text();

      // 3. Extraction des données
      const soeIndex = text.indexOf('$$SOE');
      const eoeIndex = text.indexOf('$$EOE');

      if (soeIndex === -1 || eoeIndex === -1) {
        console.warn("Pas de données SOE/EOE trouvées pour", designation);
        // Log du texte pour debug si nécessaire
        return [];
      }

      // On récupère les lignes entre les marqueurs
      const dataBlock = text.slice(soeIndex + 5, eoeIndex).trim();
      const lines = dataBlock.split('\n');

      return lines.map(line => {
        const parts = line.split(',').map(s => s.trim());

        if (parts.length >= 5) {
          const jd = parseFloat(parts[0]);
          // Conversion précise JD vers Unix Timestamp (ms)
          const timestampMs = (jd - 2440587.5) * 86400000;

          return {
            timestamp: timestampMs,
            x: parseFloat(parts[2]),
            y: parseFloat(parts[3]),
            z: parseFloat(parts[4])
          };
        }
        return null;
      }).filter(item => item !== null);

    } catch (error) {
      console.error(`Erreur éphéméride pour ${designation}:`, error);
      throw error;
    }
  }
