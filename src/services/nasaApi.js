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
    const safeDesignation = encodeURIComponent(`DES=${designation}`);
    // Utilisation du proxy Vite configuré dans vite.config.ts pour éviter les erreurs CORS
    const url = `/api/horizons.api?format=text&COMMAND='${safeDesignation}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'&START_TIME='${startDate}'&STOP_TIME='${endDate}'&STEP_SIZE='1 h'&CENTER='399'&CSV_FORMAT='YES'`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur l'API Horizons");

    const text = await response.text();

    // On extrait uniquement les données entre $$SOE et $$EOE
    const soeIndex = text.indexOf('$$SOE');
    const eoeIndex = text.indexOf('$$EOE');

    if (soeIndex === -1 || eoeIndex === -1) {
      console.warn("Pas de données SOE/EOE pour", designation);
      return [];
    }

    const dataBlock = text.slice(soeIndex + 5, eoeIndex).trim();
    const lines = dataBlock.split('\n');

    const ephemeris = [];

    for (const line of lines) {
      if (!line) continue;

      const parts = line.split(',').map(s => s.trim());
      // format CSV_FORMAT=YES: 
      // JDTDB, Calendar Date (TDB), X, Y, Z, VX, VY, VZ, LT, RG, RR

      if (parts.length >= 5) {
        const jd = parseFloat(parts[0]); // Jour Julien
        // Approximation simpliste:
        // JD to Unix Milliseconds: (JD - 2440587.5) * 86400000
        const timestampMs = (jd - 2440587.5) * 86400000;

        ephemeris.push({
          timestamp: timestampMs,
          x: parseFloat(parts[2]),
          y: parseFloat(parts[3]),
          z: parseFloat(parts[4])
        });
      }
    }

    return ephemeris;
  }
}

