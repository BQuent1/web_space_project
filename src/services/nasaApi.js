const API_KEY = 'nN3wCQcOohEwA8xbWD00dTSOSSJ6EbWRHQS1u0aF';
const BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

const AU_IN_KM = 149597870.7;

// details : https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27DES=2015%20PU56%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&START_TIME=%272026-02-02%27&STOP_TIME=%272026-02-03%27


export const nasaService = {
  async getAsteroids() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const chaine = `${BASE_URL}/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`;

      console.log(chaine);

      const response = await fetch(chaine);
      const data = await response.json();


      const rawAsteroids = data.near_earth_objects[today];

      return rawAsteroids.map(asteroid => ({
        id: asteroid.id,
        name: asteroid.name.replace('(', '').replace(')', ''),
        size: asteroid.estimated_diameter.meters.estimated_diameter_max,
        velocity: asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour,
        distance: asteroid.close_approach_data[0].miss_distance.kilometers,
        isDangerous: asteroid.is_potentially_hazardous_asteroid,
      }));
    } catch (error) { 
      console.error("Erreur lors de la récupération des astéroïdes:", error);
      return []
    }
  }
}
